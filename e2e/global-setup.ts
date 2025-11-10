import path from "path";

import { chromium, FullConfig } from "@playwright/test";

import { LoginPage } from "./pages/loginPage";
import { createIAPContext } from "./utils/iap-auth";

export const STORAGE_STATE = path.join(__dirname, ".auth/user.json");

async function globalSetup(_config: FullConfig) {
  const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
  const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
  const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

  if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
    throw new Error(
      "Missing required environment variables: REEARTH_E2E_EMAIL, REEARTH_E2E_PASSWORD, or REEARTH_WEB_E2E_BASEURL"
    );
  }

  const browser = await chromium.launch({ headless: true });
  const context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL);
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto(REEARTH_WEB_E2E_BASEURL, {
      waitUntil: "networkidle"
    });

    // Check if already logged in by looking for dashboard elements
    const isLoggedIn = await page
      .locator('[data-testid="header-user-menu"]')
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      const loginPage = new LoginPage(page);

      // Use login method from LoginPage
      await loginPage.login(REEARTH_E2E_EMAIL, REEARTH_E2E_PASSWORD);

      // Wait for navigation and accept terms if present
      await page.waitForTimeout(3000);
    }

    // Ensure we're on the dashboard before saving state
    await page.waitForTimeout(2000);

    // Save signed-in state
    await page.context().storageState({ path: STORAGE_STATE });

    console.log("✅ Global setup completed - authentication state saved");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
