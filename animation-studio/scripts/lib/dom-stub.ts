// Minimal DOM stand-in for Node scripts that import studio modules. Canvases get a do-nothing 2D context, so painted
// textures and full sets can be BUILT in Node (geometry for floor maps and tests); nothing is ever drawn or rendered.
// Tests only use the maths (cameras, marks, timings, geometry).
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const noop: Any = new Proxy(function () {}, { get: (_t, k) => (k === "data" ? new Uint8ClampedArray(4) : k === "canvas" ? { width: 2, height: 2 } : noop), apply: () => noop, construct: () => noop });
const ctx: Any = new Proxy({}, {
  get: (_t, k) => (k === "getImageData" || k === "createImageData" ? () => ({ data: new Uint8ClampedArray(16), width: 2, height: 2 }) : k === "measureText" ? () => ({ width: 10 }) : typeof k === "string" ? noop : undefined),
  set: () => true,
});
const g = globalThis as unknown as { document?: unknown };
if (!g.document) g.document = { createElement: () => ({ width: 2, height: 2, style: {}, getContext: () => ctx }) };
export {};
