// Minimal Node declarations for the TypeScript scripts (the project has no @types/node; esbuild bundles them for Node).
declare module "node:fs" { const fs: any; export default fs; } // eslint-disable-line @typescript-eslint/no-explicit-any
declare module "node:path" { const path: any; export default path; } // eslint-disable-line @typescript-eslint/no-explicit-any
declare module "node:child_process" { export const spawnSync: any; } // eslint-disable-line @typescript-eslint/no-explicit-any
declare const Buffer: { from(s: string, enc: string): Uint8Array };
