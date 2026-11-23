// Opt-in asset preloading: a theme that needs an image before the first frame (e.g. the GTA GF Blender plates) registers
// it here at import time; Short.tsx's `load` waits for every registered promise before drawing. With nothing registered
// (every earlier video) the load resolves at once, exactly as before.
export const PRELOADS: Promise<unknown>[] = [];
export const registerPreload = (p: Promise<unknown>) => { PRELOADS.push(p); };
