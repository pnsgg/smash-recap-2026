import { readFile } from "node:fs/promises";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * `import data from "file?base64"` gives the file's bytes as a base64 string. Used to carry the OG
 * image fonts and the rasteriser's WebAssembly inside the server build.
 */
function base64Import(): Plugin {
  const prefix = "\0base64:";
  return {
    name: "base64-import",
    enforce: "pre",
    async resolveId(id, importer) {
      if (!id.endsWith("?base64")) return null;
      const resolved = await this.resolve(id.slice(0, -"?base64".length), importer, { skipSelf: true });
      return resolved ? prefix + resolved.id : null;
    },
    async load(id) {
      if (!id.startsWith(prefix)) return null;
      const bytes = await readFile(id.slice(prefix.length));
      return `export default ${JSON.stringify(bytes.toString("base64"))};`;
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [base64Import(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  // The recap image renderer is only imported on the first "Download image" click. Bundle it when the
  // dev server starts, or that first click triggers a dependency re-optimization and a page reload.
  optimizeDeps: {
    include: ["@remotion/web-renderer"],
  },
  // Production only: the server build runs inside the API's compiled binary with no node_modules
  // beside it, so every dependency is bundled into it and its entry exports a plain fetch handler.
  // The dev server keeps Vite's defaults.
  ...(command === "build" && {
    ssr: {
      noExternal: true,
    },
    environments: {
      ssr: {
        build: {
          rollupOptions: {
            input: "./server/app.ts",
          },
        },
      },
    },
  }),
}));
