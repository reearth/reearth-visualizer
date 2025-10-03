import path from "path";

import { chromium, FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";

import { LoginPage } from "./pages/loginPage";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required environment variables.");
}

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the login page
  await page.goto(REEARTH_WEB_E2E_BASEURL as string, {
    waitUntil: "networkidle"
  });

  // Perform login using LoginPage
  const loginPage = new LoginPage(page);
  await loginPage.login(
    REEARTH_E2E_EMAIL as string,
    REEARTH_E2E_PASSWORD as string
  );

  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard\/.+/, { timeout: 30000 });

  // Save authentication state
  await context.storageState({ path: "./e2e/auth.json" });

  await browser.close();
}

export default globalSetup;
