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
  globalTeardown: require.resolve("./global-teardown"),
  expect: {
    timeout: 35000
  },
  timeout: 120000,
  testDir: "./",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 2,
  reporter: [
    [
      "allure-playwright",
      {
        resultsDir: "./out/allure-results",
        detail: true,
        outputFolder: "./out/allure-results",
        suiteTitle: false,
        environmentInfo: {
          node_version: process.version
        }
      }
    ]
  ],
  use: {
    trace: "retain-on-failure",
    actionTimeout: 35000,
    navigationTimeout: 35000,
    storageState: process.env.SKIP_STORAGE_STATE ? undefined : STORAGE_STATE
  },

  projects: [
    {
      name: "webkit",
      testDir: "./tests",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/plugin-api\/.*/,
      use: {
        ...devices["Desktop Safari"],
        screenshot: "only-on-failure",
        video: "on",
        headless: true,
        launchOptions: {
          slowMo: 50
        },
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: "api-setup",
      testMatch: /api\/global\.setup\.ts/,
      use: { storageState: undefined }
    },
    {
      name: "api-tests",
      testMatch: /api\/tests\/.*\.api\.spec\.ts/,
      dependencies: ["api-setup"],
      use: { storageState: undefined }
    },
    {
      name: "plugin-api-setup",
      testMatch: /tests\/plugin-api\/_setup\.ts/,
      teardown: "plugin-api-teardown",
      dependencies: ["api-setup"],
      use: {
        ...devices["Desktop Safari"],
        headless: true,
        storageState: STORAGE_STATE,
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: "plugin-api-teardown",
      testMatch: /tests\/plugin-api\/_teardown\.ts/,
      use: { storageState: undefined }
    },
    {
      name: "plugin-api",
      testDir: "./tests/plugin-api",
      testMatch: /[^_].*\.semantic\.spec\.ts/,
      dependencies: ["plugin-api-setup"],
      use: {
        ...devices["Desktop Safari"],
        screenshot: "only-on-failure",
        video: "on",
        headless: true,
        launchOptions: {
          slowMo: 50
        },
        storageState: STORAGE_STATE,
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: "chromium-visual",
      testDir: "./tests/plugin-api",
      testMatch: /[^_].*\.visual\.spec\.ts/,
      dependencies: ["plugin-api-setup"],
      expect: {
        toMatchSnapshot: {
          // Cesium renders sub-pixel differences across runs on the same GPU.
          // 50px absolute tolerance handles antialiasing and tile shimmer
          // without masking real rendering regressions.
          maxDiffPixels: 50
        }
      },
      use: {
        ...devices["Desktop Chrome"],
        headless: false,
        screenshot: "only-on-failure",
        storageState: STORAGE_STATE,
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1
      }
    }
  ]
});
