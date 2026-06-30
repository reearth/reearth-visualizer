import path from "path";

import {
  FullConfig,
  webkit,
  request as playwrightRequest
} from "@playwright/test";

import { LoginPage } from "./pages/loginPage";
import { createIAPContext } from "./utils/iap-auth";
import {
  getRecycleBinCount,
  cleanupRecycleBin,
  cleanupStaleE2eProjects,
  cleanupBrowserEnvRecycleBin
} from "./utils/project-cleanup";

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

    const apiContext = await playwrightRequest.newContext();

    // Log and clean recycle bin
    const recycleBinCount = await getRecycleBinCount(apiContext);
    console.log(`[setup] Recycle bin count before cleanup: ${recycleBinCount}`);
    if (recycleBinCount) {
      await cleanupRecycleBin(apiContext);
    }

    // Clean up stale e2e- projects from previous runs
    await cleanupStaleE2eProjects(apiContext);

    // Clean recycle bin in the browser's auth environment if it differs from dev
    // (e.g. OSS Cloud Run PR previews use api.test.reearth.dev)
    await cleanupBrowserEnvRecycleBin(apiContext, STORAGE_STATE);

    await apiContext.dispose();

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
