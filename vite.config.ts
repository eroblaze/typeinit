/// <reference types="vitest" />

import { defineConfig } from "vite";
import typescript2 from "rollup-plugin-typescript2";
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
      plugins: [
        {
          ...typescript2({
            abortOnError: false, // For some reason, they are not reading my types...
            useTsconfigDeclarationDir: true,
          }),
        },
      ],
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: "src/__tests__/setupTests.ts",
  },
});
