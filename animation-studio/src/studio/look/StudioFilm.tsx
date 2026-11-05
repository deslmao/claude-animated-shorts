// The channel's camera + post chain for ANY world (generalised from the bridge's Bridge.tsx, same values and order):
//   InkPass (world ink, own pass) -> lens blur pre + main (thin-lens DOF) -> bloom (emissive only) -> NEUTRAL tone
//   map -> colour grade, MSAA 4. Crossfades stack a second canvas; flashes are 4-frame white fades.
// Every pixel-sized parameter is specified at 1080x1920 and scales with the output size (previews at --scale 0.5 match).
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import type { EffectComposer as PPComposer } from "postprocessing";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { MotionBlurEffect, shutterTravel, THRESH_PX } from "./motionblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";

export type GradeName = keyof typeof GRADES;
/** what a world reports after posing frame f: the camera's look target, lens blur and which grade to use */
/** grade: any light name; golden / night -> their grades, everything else -> the day grade */
/** shutter: the camera's view-projection at the shutter's open and close (camera motion blur), when the frame has one */
export type ShutterEnd = { view: THREE.Matrix4; fov: number };
export type FrameInfo = { target: THREE.Vector3; cInf: number; focus?: THREE.Vector3; grade: GradeName | string; shutter?: { open: ShutterEnd; close: ShutterEnd; cap?: number } };
/** anything that can pose a three.js scene for (shot, frame) as a PURE function of those two numbers */
export interface StudioWorld { root: THREE.Object3D; update(shot: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): FrameInfo }
/** which shot(s) to draw at frame f (two layers during a crossfade) and where the white flashes are */
/** flashes: 4-frame white fades starting at each frame; dips: 12-frame dips to black centred on each frame (the cut) */
/** motionBlur: the film uses camera motion blur (look/motionblur.ts); without it the post chain is unchanged */
/** stableInk: engine-2 world ink (look/ink.ts `stable`: minimum feature width, wider anti-aliasing) */
export interface Timeline { total: number; layersAt(f: number): { id: number; alpha: number }[]; flashes?: number[]; dips?: number[]; motionBlur?: boolean; controlledBlur?: boolean; stableInk?: boolean }

/** A/B switches for test stills only (inputProps `{ post: { ink: false, ... } }`); everything is on by default */
type PostToggles = { ink: boolean; ink2: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean; motion: boolean };
const toggles = (): PostToggles => ({ ink: true, ink2: true, lens: true, pre: true, bloom: true, grade: true, grain: false, motion: true, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

/** bloom for emissive sources only; its MIP chain always starts at half of 1080x1920 so the glow keeps its size */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3(), ivp = new THREE.Matrix4(), mOpen = new THREE.Matrix4(), mClose = new THREE.Matrix4(), pcam = new THREE.PerspectiveCamera();

function Inner<K>({ id, kit, makeWorld, blur, stableInk, controlledBlur = false }: { id: number; kit: K; makeWorld: (kit: K) => StudioWorld; blur: boolean; stableInk: boolean; controlledBlur?: boolean }) {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => makeWorld(kit), [kit, makeWorld]);
  const on = useMemo(toggles, []);
  const composer = useRef<PPComposer | null>(null), shut = useRef<FrameInfo["shutter"]>(undefined);
  // camera motion blur, set just before the composer draws (priority 0 runs before its priority-1 render), with the
  // camera exactly as it is drawn (the canvas's real aspect: on a render worker's first frame it is only set after
  // this component renders). Frames that move less than THRESH_PX skip the pass entirely (no cost, no change)
  useFrame(({ camera: c }) => {
    if (!blur || !on.motion) return;
    const cam = c as THREE.PerspectiveCamera, sh = shut.current, pass = composer.current?.passes.find((p) => (p as unknown as { effects?: unknown[] }).effects?.includes(fx.motion));
    const vp = (e: { view: THREE.Matrix4; fov: number }, out: THREE.Matrix4) => { pcam.copy(cam); pcam.fov = e.fov; pcam.updateProjectionMatrix(); return out.multiplyMatrices(pcam.projectionMatrix, e.view); };
    const ends = sh ? { open: vp(sh.open, mOpen), close: vp(sh.close, mClose) } : undefined;
    const moving = !!ends && shutterTravel(cam, ends) >= THRESH_PX;
    fx.motion.set(ivp.multiplyMatrices(cam.matrixWorld, cam.projectionMatrixInverse), moving ? ends : undefined, sh?.cap);
    if (pass) pass.enabled = moving;
  }, 0);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera, stableInk && on.ink2 ? { stable: true } : {}),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }), // OFF by default: the reference has no grain
    motion: new MotionBlurEffect({ controlled: controlledBlur }),
  }), [camera, scene, stableInk, on, controlledBlur]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4} ref={composer}>
      {[
        on.ink && <primitive key="ink" object={fx.ink} dispose={null} />,
        // controlled blur: depth of field BEFORE motion blur. The composer ping-pongs two buffers and the scene depth
        // is attached to one of them: switching the motion pass on in front of the lens passes (it is enabled only on
        // moving frames) flips which buffer each lens pass draws into, so one of them reads the depth it is writing
        // over and defocuses the whole frame (the "blurry transition frames"). After the lens passes, the motion pass
        // can switch on and off without moving them. Films made before keep their order (and their pixels).
        blur && on.motion && !controlledBlur && <primitive key="motion" object={fx.motion} dispose={null} />,
        on.lens && on.pre && <primitive key="pre" object={fx.lens.pre} dispose={null} />,
        on.lens && <primitive key="lens" object={fx.lens.main} dispose={null} />,
        blur && on.motion && controlledBlur && <primitive key="motion" object={fx.motion} dispose={null} />,
        on.bloom && <primitive key="bloom" object={fx.bloom} dispose={null} />,
        <primitive key="tone" object={fx.tone} dispose={null} />,
        on.grade && <primitive key="grade" object={fx.grade} dispose={null} />,
        on.grain && <primitive key="grain" object={fx.grain} dispose={null} />,
      ].filter((x): x is React.JSX.Element => !!x)}
    </EffectComposer>
  ), [fx, on, blur, controlledBlur]);
  const cam = camera as THREE.PerspectiveCamera;
  const info = world.update(id, f, cam, scene);
  noInkFallback(world.root);
  // thin-lens focus: distance along the view axis to the focus point (default: the camera's look target)
  cam.getWorldDirection(fwd);
  fpt.copy(info.focus ?? info.target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.motion.setSubject(cam.position, fwd, fx.lens.focus);
  fx.lens.cInf = info.cInf;
  shut.current = blur && on.motion ? info.shutter : undefined;
  gradeFor(fx.grade, info.grade === "golden" || info.grade === "night" ? info.grade : "day");
  fx.grain.seed = f;
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
}

/** test stills only: inputProps `{ post: { dpr: 0.5 } }` forces the WebGL buffer size (R3F clamps dpr to >= 1) */
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;

/** Renders a timeline of shots from a world. `load` runs once before the first frame (e.g. fonts or models). */
export function StudioFilm<K>({ timeline, makeWorld, load, background = "#cfe3f2" }:
  { timeline: Timeline; makeWorld: (kit: K) => StudioWorld; load: () => Promise<K>; background?: string }) {
  const f = useCurrentFrame();
  const [kit, setKit] = useState<K | null>(null);
  const [handle] = useState(() => delayRender("studio load"));
  useEffect(() => { load().then((k) => { setKit(() => k); continueRender(handle); }); }, [handle, load]);
  if (kit === null) return null;
  let flash = 0;
  for (const a of timeline.flashes ?? []) if (f >= a && f < a + 4) flash = Math.max(flash, [1, 0.75, 0.45, 0.2][f - a]);
  let dip = 0;
  for (const c of timeline.dips ?? []) if (f >= c - 6 && f < c + 6) dip = Math.max(dip, 1 - Math.abs(f + 0.5 - c) / 6);
  return (
    <AbsoluteFill style={{ background }}>
      {timeline.layersAt(f).map((l, i) => (
        <AbsoluteFill key={i ? "over" : "base"} style={{ opacity: l.alpha }}>
          <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows
            gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
            camera={{ fov: 40, near: 0.2, far: 1500 }}>
            <Inner id={l.id} kit={kit} makeWorld={makeWorld} blur={!!timeline.motionBlur} stableInk={!!timeline.stableInk} controlledBlur={!!timeline.controlledBlur} />
          </ThreeCanvas>
        </AbsoluteFill>
      ))}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {dip > 0 && <AbsoluteFill style={{ background: "#0b0a10", opacity: Math.min(1, dip * 1.25) }} />}
    </AbsoluteFill>
  );
}
