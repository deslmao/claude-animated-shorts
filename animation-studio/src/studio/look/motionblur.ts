// Camera motion blur (Visual Storytelling 2.0): fast camera moves (flights, whips, zoom-throughs) smear along their
// motion, so speed reads as speed and not as judder. Deterministic, a pure function of the camera at this frame and
// half a shutter either side: every pixel's world point is rebuilt from the depth buffer, projected with the camera
// at the shutter's open and close, and the image is gathered along that screen-space path (fixed taps, no noise).
// Camera motion only (actors on a held camera stay sharp). Slow creeps stay pixel-identical: below THRESH px of
// travel per shutter nothing is blurred, and the length above it ramps in smoothly. Opt-in per storyboard
// (`motionBlur`), so films that don't ask for it are unchanged.
import { Effect, EffectAttribute, BlendFunction } from "postprocessing";
import { Matrix4, PerspectiveCamera, Uniform, Vector3 } from "three";

/** below this much travel (px at 1080x1920) during the shutter nothing is blurred */
export const THRESH_PX = 2;

const frag = /* glsl */ `
uniform mat4 invViewProj;   // this frame: clip -> world
uniform mat4 openVP;        // world -> clip at the shutter's open
uniform mat4 closeVP;       // and at its close
uniform float on;           // 0 = this frame has no blur (a held camera, a cut)
uniform float maxPx;        // longest smear, px at 1080x1920
#ifdef CONTROLLED
uniform vec3 camPos;        // this frame's camera
uniform vec3 camFwd;        // and its view axis
uniform float focusDist;    // the lens's focus distance along the view axis: where the subject is
#define SUBJECT_K 0.3       // the subject smears 30 % of what the background does
#endif
#define TAPS 24
#define THRESH ${THRESH_PX.toFixed(1)}

vec2 toUv(mat4 m, vec3 w, out float ok) { vec4 c = m * vec4(w, 1.0); ok = step(1e-4, c.w); return c.xy / max(c.w, 1e-4) * 0.5 + 0.5; }

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  if (on < 0.5) { outputColor = inputColor; return; }
  float s = resolution.y / 1920.0;
  vec4 w4 = invViewProj * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec3 w = w4.xyz / w4.w;
  float ok0, ok1;
  vec2 a = toUv(openVP, w, ok0), b = toUv(closeVP, w, ok1);
  if (ok0 * ok1 < 0.5) { outputColor = inputColor; return; }
  vec2 d = (b - a) * resolution;               // px travelled during the shutter
  float L = length(d);
  float keep = clamp(L - THRESH * s, 0.0, maxPx * s);
#ifdef CONTROLLED
  // subject protection: a point near the focus distance keeps most of its shape, the background still streaks
  float near = abs(dot(w - camPos, camFwd) - focusDist) / max(focusDist, 0.3);
  keep *= mix(SUBJECT_K, 1.0, smoothstep(0.12, 0.6, near));
#endif
  if (keep < 0.5) { outputColor = inputColor; return; }
  vec2 step = (d / L) * keep * texelSize;      // the smear, centred on this pixel
  vec3 acc = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float t = (float(i) + 0.5) / float(TAPS) - 0.5;
#ifdef CONTROLLED
    float wt = 1.0 - 1.6 * abs(t);           // centre-weighted: a solid core image with soft trails
#else
    float wt = 1.0;
#endif
    acc += texture2D(inputBuffer, uv + step * t).rgb * wt; wsum += wt;
  }
  outputColor = vec4(acc / wsum, inputColor.a);
}`;

export class MotionBlurEffect extends Effect {
  readonly controlled: boolean;
  /** controlled = the 2.0 blur correction (subject protection + centre-weighted smear, 36 px cap); off = as before */
  constructor({ maxPx, controlled = false }: { maxPx?: number; controlled?: boolean } = {}) {
    super("MotionBlurEffect", frag, {
      defines: controlled ? new Map([["CONTROLLED", "1"]]) : new Map(),
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.DEPTH | EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ["invViewProj", new Uniform(new Matrix4())], ["openVP", new Uniform(new Matrix4())], ["closeVP", new Uniform(new Matrix4())],
        ["on", new Uniform(0)], ["maxPx", new Uniform(maxPx ?? (controlled ? 36 : 60))],
        ...(controlled ? [["camPos", new Uniform(new Vector3())], ["camFwd", new Uniform(new Vector3())], ["focusDist", new Uniform(5)]] as [string, Uniform][] : []),
      ]),
    });
    this.controlled = controlled;
  }
  /** controlled blur: the camera and the lens's focus distance this frame */
  setSubject(pos: Vector3, fwd: Vector3, focus: number) {
    if (!this.controlled) return;
    (this.uniforms.get("camPos")!.value as Vector3).copy(pos); (this.uniforms.get("camFwd")!.value as Vector3).copy(fwd);
    this.uniforms.get("focusDist")!.value = focus;
  }
  /** this frame's camera (clip -> world) and the camera at the shutter's open and close; null = no blur */
  set(invViewProj: Matrix4, shutter: { open: Matrix4; close: Matrix4 } | undefined, capPx?: number) {
    this.uniforms.get("on")!.value = shutter ? 1 : 0;
    if (this.controlled) this.uniforms.get("maxPx")!.value = capPx ?? 36;   // controlled: the beat's smear cap
    if (!shutter) return;
    (this.uniforms.get("invViewProj")!.value as Matrix4).copy(invViewProj);
    (this.uniforms.get("openVP")!.value as Matrix4).copy(shutter.open);
    (this.uniforms.get("closeVP")!.value as Matrix4).copy(shutter.close);
  }
}

/** the most any part of the picture travels during the shutter (px at 1080x1920): points on a 3 x 3 screen grid at
 *  1 to 100 m, projected at the shutter's open and close. Under THRESH_PX the pass is switched off for the frame
 *  (it would leave every pixel as it is), so held and slowly creeping shots cost nothing */
const gp = new Vector3(), gw = new Vector3(), ga = new Vector3(), gb = new Vector3();
export const shutterTravel = (cam: PerspectiveCamera, sh: { open: Matrix4; close: Matrix4 }) => {
  let m = 0;
  for (const x of [-0.9, 0, 0.9]) for (const y of [-0.9, 0, 0.9]) {
    gp.set(x, y, 0.5).unproject(cam).sub(cam.position).normalize();
    for (const d of [1, 3, 10, 100]) {
      gw.copy(cam.position).addScaledVector(gp, d);
      ga.copy(gw).applyMatrix4(sh.open); gb.copy(gw).applyMatrix4(sh.close);
      m = Math.max(m, Math.hypot((ga.x - gb.x) * 540, (ga.y - gb.y) * 960));
    }
  }
  return m;
};
