import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { globalConst } from "vite-plugin-global-const";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte(),
    viteSingleFile(),
    globalConst({
      VITE_BUILD: new Date().toISOString(),
    }),
  ],
  build: {
    target: "esnext",
  },
});
