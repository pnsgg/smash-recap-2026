// The server build runs on Bun; only the environment variables are used from `process`.
declare const process: { env: Record<string, string | undefined> };

// Files imported with `?base64` (see vite.config.ts) arrive as base64 strings.
declare module "*?base64" {
  const data: string;
  export default data;
}
