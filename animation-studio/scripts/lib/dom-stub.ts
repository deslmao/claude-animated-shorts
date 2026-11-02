// Minimal DOM stand-in for Node tests that import studio modules (a few build tiny placeholder canvases at load time).
// Nothing is drawn: tests only use the maths (cameras, marks, timings).
const g = globalThis as unknown as { document?: unknown };
if (!g.document) g.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => null }) };
export {};
