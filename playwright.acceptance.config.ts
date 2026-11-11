import { defineConfig, devices } from "@playwright/test";

// Browser specs of the acceptance suite (tests/acceptance/<capability>/*.spec.ts).
// Same dedicated port as playwright.config.ts: the two never run together.
const PORT = 5178;

export default defineConfig({
  testDir: "./tests/acceptance",
  testMatch: "**/*.spec.ts",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  // The merge gate reads one run; a retry would hide an unreliable test.
  retries: 0,
  // A flow that signs in and checks out takes several seconds on a CI runner.
  timeout: 15_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [["list"], ["junit", { outputFile: ".vortex-results/acceptance/e2e-junit.xml" }]]
    : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // An agent container's small /dev/shm hangs Chromium.
    launchOptions: { args: ["--disable-dev-shm-usage"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bun --bun ./node_modules/vite/bin/vite.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
  },
});
