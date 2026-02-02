import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { globalConst } from "vite-plugin-global-const";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile(),
    globalConst({
      VITE_BUILD: new Date().toISOString(),
    }),
    nodePolyfills({
      include: ["zlib", "buffer", "stream", "util"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "node:buffer": "buffer",
      "node:zlib": "browserify-zlib",
    },
  },
});
