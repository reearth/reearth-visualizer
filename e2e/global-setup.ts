import path from "path";

import { FullConfig, webkit } from "@playwright/test";
import * as dotenv from "dotenv";

import { LoginPage } from "./pages/loginPage";
import { createIAPContext } from "./utils/iap-auth";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required environment variables.");
}

async function globalSetup(_config: FullConfig) {
  const browser = await webkit.launch({
    headless: true,
  });

  const context = await createIAPContext(
    browser,
    REEARTH_WEB_E2E_BASEURL as string
  );

  const page = await context.newPage();

  try {
    console.log('🔐 Starting authentication setup...');

    // Navigate to the login page
    await page.goto(REEARTH_WEB_E2E_BASEURL as string, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log('📄 Page loaded, attempting login...');

    // Perform login using LoginPage
    const loginPage = new LoginPage(page);
    await loginPage.login(
      REEARTH_E2E_EMAIL as string,
      REEARTH_E2E_PASSWORD as string
    );

    console.log('⏳ Waiting for dashboard navigation...');

    // Wait for navigation to dashboard - be more flexible
    try {
      await page.waitForURL(/\/dashboard\/.+/, { timeout: 10000 });
    } catch (e) {
      // If URL doesn't match, check if we're already on a valid page
      const currentUrl = page.url();
      console.log('Current URL after login:', currentUrl);

      // If we're at the root, try to navigate to dashboard manually
      if (currentUrl === `${REEARTH_WEB_E2E_BASEURL}/` || !currentUrl.includes('/dashboard/')) {
        console.log('Manually navigating to dashboard...');
        // Wait a bit for any redirects to finish
        await page.waitForTimeout(3000);

        // Check if there's a workspace/dashboard selector
        const dashboardLink = page.locator('[href*="/dashboard/"]').first();
        if (await dashboardLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await dashboardLink.click();
          await page.waitForURL(/\/dashboard\/.+/, { timeout: 15000 });
        } else {
          // Try to find any link that goes to dashboard
          await page.goto(`${REEARTH_WEB_E2E_BASEURL}/dashboard`, { waitUntil: 'domcontentloaded' });
        }
      }
    }

    console.log('✅ Successfully logged in, final URL:', page.url());

    // Save authentication state
    await context.storageState({ path: "./e2e/auth.json" });

    console.log('💾 Authentication state saved successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);

    // Take screenshot for debugging
    await page.screenshot({ path: './e2e/global-setup-error.png', fullPage: true });
    console.log('📸 Error screenshot saved to: ./e2e/global-setup-error.png');

    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
