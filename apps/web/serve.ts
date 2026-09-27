import { join, resolve } from "path";

const DIST_DIR = resolve(import.meta.dir, "dist");
const INDEX = Bun.file(join(DIST_DIR, "index.html"));

Bun.serve({
  port: Number(process.env.PORT ?? 80),
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const resolved = resolve(DIST_DIR, `.${pathname}`);
    const file = resolved.startsWith(DIST_DIR) ? Bun.file(resolved) : undefined;
    const body = file && (await file.exists()) && pathname !== "/" ? file : INDEX;
    return new Response(body, { headers: { "content-type": body.type } });
  },
});
