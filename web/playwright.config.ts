import { devices, type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const config: PlaywrightTestConfig = {
  timeout: 0,
  use: {
    baseURL: process.env.REEARTH_WEB_E2E_BASEURL || "http://localhost:3000/",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: false
  },
  testDir: "e2e",
  // globalSetup: "./e2e/utils/setup.ts", //old way
  globalSetup: "./e2e/auth.setup.ts",
  reporter: process.env.CI ? "github" : "list",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        headless: false,
        screenshot: "on",
        video: "on",
        launchOptions: {
          // args: ["--headless","--no-sandbox","--use-angle=gl"]
          args: ["--no-sandbox"]
        }
      }
    }
  ]
};

export default config;
