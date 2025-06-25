import path from "path";

import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  expect: {
    timeout: 10000 // 10 seconds for expect assertions
  },
  timeout: 10000, // 10 seconds per test
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // workers: process.env.CI ? 1 : undefined,
  workers: 2, // Set to 2 workers
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: "./test-report" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',
    // baseURL: process.env.REEARTH_WEB_E2E_BASEURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    actionTimeout: 10000, // optional: increase action timeout
    navigationTimeout: 20000 // optional: increase navigation timeout
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        screenshot: "only-on-failure",
        headless: true,
        launchOptions: {
          slowMo: 400
        }
      }
    }

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    // /* Test against mobile viewports. */
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },

    // /* Test against branded browsers. */
    // {
    //   name: "Microsoft Edge",
    //   use: { ...devices["Desktop Edge"], channel: "msedge" },
    // },
    // {
    //   name: "Google Chrome",
    //   use: { ...devices["Desktop Chrome"], channel: "chrome" },
    // },
  ]

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
