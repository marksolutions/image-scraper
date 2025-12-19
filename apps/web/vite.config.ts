import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: { port: 8001 },
  build: { outDir: "dist" },
});
