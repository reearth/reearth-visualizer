import path from "path";

import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export const STORAGE_STATE = path.join(__dirname, ".auth/user.json");
export const API_AUTH_STATE = path.join(__dirname, ".auth/api-token.json");

export default defineConfig({
  globalSetup: process.env.SKIP_STORAGE_STATE
    ? undefined
    : require.resolve("./global-setup"),
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
    storageState: process.env.SKIP_STORAGE_STATE ? undefined : STORAGE_STATE
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
          slowMo: 200
        },
        viewport: { width: 1920, height: 1080 }
      }
    }
  ]
});
