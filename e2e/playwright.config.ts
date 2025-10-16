import path from "path";

import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  globalSetup: require.resolve("./global-setup"),
  expect: {
    timeout: 15000
  },
  timeout: 60000,
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 5,
  reporter: [["html", { outputFolder: "./test-report", open: "never" }]],
  use: {
    trace: "on-first-retry",
    actionTimeout: 15000,
    navigationTimeout: 30000,
    storageState: "./e2e/auth.json",
    // Performance optimizations
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    // Use domcontentloaded instead of networkidle for faster page loads
    // This can be overridden per test if needed
  },

  projects: [
    {
      name: "webkit",
      testIgnore: /api\/.*\.ts/,
      use: {
        ...devices["Desktop Safari"],
        screenshot: "only-on-failure",
        headless: true,
        launchOptions: {
          // No slowMo for faster execution - removed for performance
        },
        viewport: { width: 1920, height: 1080 }
      }
    }
  ]
});
