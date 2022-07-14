/// <reference types="vitest" />

import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";
const path = require("path");

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Typeinit",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"], // This is the default
    },
    rollupOptions: {
      plugins: [typescript()],
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: "src/__tests__/setupTests.ts",
  },
});
