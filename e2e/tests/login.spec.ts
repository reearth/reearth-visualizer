import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { DashBoardPage } from "../pages/dashBoardPage";
import { LoginPage } from "../pages/loginPage";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required variables.");
}

test.describe("Login Page Tests", () => {
  let context: BrowserContext;
  let page: Page;
  let loginPage: LoginPage;
  let dashBoardPage: DashBoardPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(20000);
    context = await browser.newContext({
      recordVideo: {
        dir: "videos/",
        size: { width: 1280, height: 720 }
      }
    });
    page = await context.newPage();
    loginPage = new LoginPage(page);
    dashBoardPage = new DashBoardPage(page);
    await page.goto(REEARTH_WEB_E2E_BASEURL, { waitUntil: "networkidle" });
  });
  // eslint-disable-next-line no-empty-pattern
  test.afterEach(async ({}, testInfo) => {
    const videoPath = await page.video()?.path();
    if (videoPath) {
      await testInfo.attach("video", {
        path: videoPath,
        contentType: "video/webm"
      });
    }
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("should Verify the login page", async () => {
    await loginPage.appTitle.waitFor({ state: "visible" });
    await expect(loginPage.appTitle).toHaveText("Re:Earth Visualizer SPA");
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toHaveText(
      "Don't remember your password?"
    );
  });

  test("should show error message for empty username", async () => {
    await loginPage.login("", REEARTH_E2E_PASSWORD);
    await expect(loginPage.errorMessagePassword).toBeVisible();
    await expect(loginPage.errorMessagePassword).toHaveText(
      "Username can't be blank"
    );
  });

  test("should show error message for empty password", async () => {
    await loginPage.login(REEARTH_E2E_EMAIL, "");
    await expect(loginPage.forgotPasswordError).toBeVisible();
    await expect(loginPage.forgotPasswordError).toHaveText(
      "Password can't be blank"
    );
  });

  test("should show error message for invalid credentials", async () => {
    await loginPage.login(faker.internet.email(), faker.internet.password());
    await expect(loginPage.loginErrorMessage).toBeVisible();
    await expect(loginPage.loginErrorMessage).toHaveText(
      "Wrong username or password."
    );
  });

  test("should login to the system and verify dashboard, logout and verify login page again", async () => {
    await loginPage.login(REEARTH_E2E_EMAIL, REEARTH_E2E_PASSWORD);
    await page.waitForURL(/\/dashboard\/.+/, { timeout: 30000 });
    const currentURL = page.url();
    // await expect(dashBoardPage.projects).toBeVisible();
    await expect(dashBoardPage.recycleBin).toBeVisible();
    await expect(dashBoardPage.pluginPlayground).toBeVisible();
    await expect(dashBoardPage.documentation).toBeVisible();
    await dashBoardPage.logOut();
    await expect(loginPage.appTitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    // Try accessing dashboard again
    await page.goto(currentURL);
    await expect(loginPage.appTitle).toBeVisible();
  });
});
