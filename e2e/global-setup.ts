import path from "path";

import { FullConfig, webkit } from "@playwright/test";

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

  const browser = await webkit.launch({ headless: true });
  const context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL);
  const page = await context.newPage();

  try {
    await page.goto(REEARTH_WEB_E2E_BASEURL, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    const isLoggedIn = await page
      .locator('[data-testid="header-user-menu"]')
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      const loginPage = new LoginPage(page);
      await loginPage.login(REEARTH_E2E_EMAIL, REEARTH_E2E_PASSWORD);

      await page.waitForURL((url) => !url.toString().includes("auth0.com"), {
        timeout: 30000
      });
      await page.waitForTimeout(2000);
    }

    await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
      timeout: 20000,
      state: "visible"
    });

    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      throw new Error(
        "Authentication failed - redirected to login page"
      );
    }

    await page.context().storageState({ path: STORAGE_STATE });

    console.log("✅ Global setup completed - authentication state saved");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    console.error("Current URL:", page.url());

    try {
      await page.screenshot({ path: "./test-results/global-setup-error.png" });
      console.error("Screenshot saved to: ./test-results/global-setup-error.png");
    } catch (screenshotError) {
      console.error("Could not save screenshot:", screenshotError);
    }

    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
