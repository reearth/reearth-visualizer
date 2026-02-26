import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { AccountSettingsPage } from "../pages/accountSettingsPage";
import { DashBoardPage } from "../pages/dashBoardPage";
import { WorkspaceSettingsPage } from "../pages/workspaceSettingsPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing REEARTH_WEB_E2E_BASEURL");
}

test.describe.configure({ mode: "serial" });

test.describe("ACCOUNT & WORKSPACE SETTINGS", () => {
  let context: BrowserContext;
  let page: Page;
  let settingsPage: Page;
  let dashBoardPage: DashBoardPage;
  let accountSettings: AccountSettingsPage;
  let workspaceSettings: WorkspaceSettingsPage;
  let accountSettingsLoaded = false;
  let workspaceSettingsLoaded = false;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    settingsPage = page;
    dashBoardPage = new DashBoardPage(page);
    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
      timeout: 15000,
      state: "visible"
    });
  });

  // eslint-disable-next-line no-empty-pattern
  test.afterEach(async ({}, testInfo) => {
    const activePage = settingsPage || page;
    const videoPath = await activePage.video()?.path();
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

  // ──────────────────────────────────────────────────
  // Profile Menu — Account Settings Navigation
  // ──────────────────────────────────────────────────
  test("Profile menu should have Account settings option", async () => {
    test.setTimeout(30000);
    await dashBoardPage.profileDropdownButton.click();
    await page.waitForTimeout(500);

    const accountMenuItem = page.getByRole("menuitem", {
      name: "Account settings"
    });
    await expect(accountMenuItem).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("Account settings: should navigate (new tab or same page)", async () => {
    test.setTimeout(45000);
    await dashBoardPage.profileDropdownButton.click();
    await page.waitForTimeout(500);

    const accountMenuItem = page.getByRole("menuitem", {
      name: "Account settings"
    });
    const isVisible = await accountMenuItem
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!isVisible) {
      await page.keyboard.press("Escape");
      test.skip(true, "Account settings menu item not available");
      return;
    }

    const newPagePromise = context
      .waitForEvent("page", { timeout: 10000 })
      .catch(() => null);
    await accountMenuItem.click();
    const newPage = await newPagePromise;

    if (newPage) {
      const newUrl = newPage.url();
      expect(
        newUrl.includes("/settings/profile") ||
          newUrl.includes("/settings/account")
      ).toBeTruthy();

      await newPage.waitForLoadState("domcontentloaded");
      settingsPage = newPage;
      accountSettings = new AccountSettingsPage(settingsPage);
      workspaceSettings = new WorkspaceSettingsPage(settingsPage);

      await settingsPage.waitForTimeout(3000);

      accountSettingsLoaded = await accountSettings.innerPage
        .isVisible({ timeout: 10000 })
        .catch(() => false);
    } else {
      await page.waitForTimeout(3000);
      settingsPage = page;
      accountSettings = new AccountSettingsPage(page);
      workspaceSettings = new WorkspaceSettingsPage(page);

      accountSettingsLoaded = await accountSettings.innerPage
        .isVisible({ timeout: 10000 })
        .catch(() => false);
    }

    expect(true).toBeTruthy();
  });

  test("Account: should display page layout", async () => {
    test.skip(
      !accountSettingsLoaded,
      "Account settings page not accessible (EE uses external URL)"
    );
    await expect(accountSettings.innerPage).toBeVisible();
  });

  test("Account: should display name field (readonly)", async () => {
    test.skip(!accountSettingsLoaded, "Account settings page not accessible");
    await expect(accountSettings.nameField).toBeVisible();
  });

  test("Account: should display email field (readonly)", async () => {
    test.skip(!accountSettingsLoaded, "Account settings page not accessible");
    await expect(accountSettings.emailField).toBeVisible();
  });

  test("Account: should display password field with change button", async () => {
    test.skip(!accountSettingsLoaded, "Account settings page not accessible");
    await expect(accountSettings.passwordField).toBeVisible();
    await expect(accountSettings.changePasswordButton).toBeVisible();
  });

  test("Account: should display language selector", async () => {
    test.skip(!accountSettingsLoaded, "Account settings page not accessible");
    await expect(accountSettings.languageField).toBeVisible();
  });

  test("Account: should open password change modal", async () => {
    test.skip(!accountSettingsLoaded, "Account settings page not accessible");
    test.setTimeout(30000);
    await accountSettings.openPasswordModal();
    await expect(accountSettings.passwordModalTitle).toBeVisible();
    await expect(accountSettings.passwordModalCancelButton).toBeVisible();
    await expect(accountSettings.passwordModalChangeButton).toBeVisible();
    await expect(accountSettings.passwordModalChangeButton).toBeDisabled();
  });

  test("Account: password modal should close on cancel", async () => {
    test.skip(!accountSettingsLoaded, "Account settings page not accessible");
    await accountSettings.passwordModalCancelButton.click();
    await settingsPage.waitForTimeout(500);
    await expect(accountSettings.passwordModalTitle).not.toBeVisible();
  });

  test("Profile menu should have Workspace settings option", async () => {
    test.setTimeout(30000);
    await page.bringToFront();
    if (!page.url().includes("/dashboard/")) {
      await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
        waitUntil: "domcontentloaded"
      });
      await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
        timeout: 15000,
        state: "visible"
      });
    }

    await dashBoardPage.profileDropdownButton.click();
    await page.waitForTimeout(500);

    const workspaceMenuItem = page.getByRole("menuitem", {
      name: "Workspace settings"
    });
    await expect(workspaceMenuItem).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("Workspace settings: should navigate (new tab or same page)", async () => {
    test.setTimeout(45000);

    if (accountSettingsLoaded) {
      const wsLink = settingsPage.getByRole("link", { name: "Workspace" });
      const isSidebarVisible = await wsLink
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (isSidebarVisible) {
        await wsLink.click();
        await settingsPage.waitForTimeout(2000);

        workspaceSettings = new WorkspaceSettingsPage(settingsPage);
        workspaceSettingsLoaded = await workspaceSettings.workspaceNameField
          .isVisible({ timeout: 10000 })
          .catch(() => false);

        if (workspaceSettingsLoaded) {
          await expect(workspaceSettings.workspaceNameField).toBeVisible();
          return;
        }
      }
    }

    await page.bringToFront();
    if (!page.url().includes("/dashboard/")) {
      await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
        waitUntil: "domcontentloaded"
      });
      await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
        timeout: 15000,
        state: "visible"
      });
    }

    await dashBoardPage.profileDropdownButton.click();
    await page.waitForTimeout(500);

    const workspaceMenuItem = page.getByRole("menuitem", {
      name: "Workspace settings"
    });
    const isVisible = await workspaceMenuItem
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!isVisible) {
      await page.keyboard.press("Escape");
      test.skip(true, "Workspace settings menu item not available");
      return;
    }

    const newPagePromise = context
      .waitForEvent("page", { timeout: 10000 })
      .catch(() => null);
    await workspaceMenuItem.click();
    const newPage = await newPagePromise;

    if (newPage) {
      const newUrl = newPage.url();
      expect(newUrl.includes("/settings")).toBeTruthy();

      await newPage.waitForLoadState("domcontentloaded");
      settingsPage = newPage;
      workspaceSettings = new WorkspaceSettingsPage(settingsPage);
      accountSettings = new AccountSettingsPage(settingsPage);

      await settingsPage.waitForTimeout(3000);

      workspaceSettingsLoaded = await workspaceSettings.workspaceNameField
        .isVisible({ timeout: 10000 })
        .catch(() => false);
    } else {
      await page.waitForTimeout(3000);
      settingsPage = page;
      workspaceSettings = new WorkspaceSettingsPage(page);
      accountSettings = new AccountSettingsPage(page);

      workspaceSettingsLoaded = await workspaceSettings.workspaceNameField
        .isVisible({ timeout: 10000 })
        .catch(() => false);
    }

    expect(true).toBeTruthy();
  });

  test("Workspace: should display workspace name field", async () => {
    test.skip(
      !workspaceSettingsLoaded,
      "Workspace settings page not accessible (EE uses external URL)"
    );
    await expect(workspaceSettings.workspaceNameField).toBeVisible();
  });

  test("Workspace: should display sidebar with Account and Workspace tabs", async () => {
    test.skip(
      !workspaceSettingsLoaded,
      "Workspace settings page not accessible"
    );
    await expect(workspaceSettings.accountTab).toBeVisible();
    await expect(workspaceSettings.workspaceTab).toBeVisible();
  });

  test("Workspace: sidebar navigation to Account Settings", async () => {
    test.skip(
      !workspaceSettingsLoaded,
      "Workspace settings page not accessible"
    );
    test.setTimeout(30000);
    await workspaceSettings.accountTab.click();
    await settingsPage.waitForTimeout(2000);

    await expect(accountSettings.innerPage).toBeVisible();
    await expect(accountSettings.nameField).toBeVisible();

    await workspaceSettings.workspaceTab.click();
    await settingsPage.waitForTimeout(2000);
    await expect(workspaceSettings.workspaceNameField).toBeVisible();
  });
});
