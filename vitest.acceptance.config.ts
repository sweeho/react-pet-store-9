import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";

// Runs only the acceptance unit tests (`bun run test:acceptance`). The default
// config excludes tests/acceptance/**; its Playwright specs (*.spec.ts in each capability folder) belong to
// playwright.acceptance.config.ts and are excluded here too.
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ["react", "react-router"],
      dts: "./auto-imports.d.ts",
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["tests/acceptance/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "tests/acceptance/**/*.spec.ts"],
  },
});
