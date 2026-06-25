import fs from "fs";
import path from "path";

import { FullConfig, webkit, request as playwrightRequest } from "@playwright/test";

import { LoginPage } from "./pages/loginPage";
import { createIAPContext } from "./utils/iap-auth";
import { getRecycleBinCount } from "./utils/project-cleanup";

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
      .locator('[data-testid="projects-manager-wrapper"]')
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      const loginPage = new LoginPage(page);
      await loginPage.login(REEARTH_E2E_EMAIL, REEARTH_E2E_PASSWORD);

      // Wait for navigation to complete and verify login was successful
      await page.waitForLoadState("networkidle");

      // Wait for the projects manager wrapper to appear, confirming successful login
      await page.waitForSelector('[data-testid="projects-manager-wrapper"]', {
        timeout: 30000,
        state: "visible"
      });
    }

    // Verify we're on the dashboard and not on login page
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      throw new Error(
        "Global setup failed: Still on login page after authentication attempt"
      );
    }

    // Verify dashboard elements are present
    const isDashboardLoaded = await page
      .locator('[data-testid="profile-wrapper"]')
      .isVisible();

    if (!isDashboardLoaded) {
      throw new Error("Global setup failed: Dashboard not loaded after login");
    }

    // Save signed-in state
    await page.context().storageState({ path: STORAGE_STATE });

    // Check recycle bin count and warn if it may cause test failures
    const apiContext = await playwrightRequest.newContext();
    const recycleBinCount = await getRecycleBinCount(apiContext);
    await apiContext.dispose();

    const recycleBinInfo = { count: recycleBinCount };
    fs.writeFileSync(
      path.join(__dirname, ".auth/recycle-bin-info.json"),
      JSON.stringify(recycleBinInfo)
    );

    if (recycleBinCount >= 16) {
      console.warn(
        `⚠️  Recycle bin has ${recycleBinCount} deleted project(s). ` +
        `Tests that rely on the recycle bin will be skipped (first page shows 16 items). ` +
        `Clean up the recycle bin for the test account to re-enable these tests.`
      );
    } else {
      console.log(`🗑️  Recycle bin count: ${recycleBinCount}`);
    }

    console.log(
      "✅ Global setup completed - authentication state saved to:",
      STORAGE_STATE
    );
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    console.error("Current URL:", page.url());

    try {
      await page.screenshot({ path: "./test-results/global-setup-error.png" });
      console.error(
        "Screenshot saved to: ./test-results/global-setup-error.png"
      );
    } catch (screenshotError) {
      console.error("Could not save screenshot:", screenshotError);
    }

    // Take a screenshot for debugging
    await page.screenshot({
      path: path.join(__dirname, "global-setup-error.png"),
      fullPage: true
    });
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
