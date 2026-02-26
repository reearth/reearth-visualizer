import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { DashBoardPage } from "../pages/dashBoardPage";
import { ProjectSettingsPage } from "../pages/projectSettingsPage";
import { ProjectsPage } from "../pages/projectsPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing REEARTH_WEB_E2E_BASEURL");
}

const projectName = faker.lorem.words(2);
const projectAlias = faker.string.alphanumeric(15);

test.describe.configure({ mode: "serial" });

test.describe("PROJECT SETTINGS - All Tabs", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let settingsPage: ProjectSettingsPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    settingsPage = new ProjectSettingsPage(page);
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

  test("Setup: Create a project for settings tests", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      "Test project for settings"
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Navigate to Project Settings via context menu", async () => {
    test.setTimeout(30000);
    const menuBtn = projectsPage.gridProjectMenuButton(projectName).first();
    await menuBtn.click();
    await page.waitForTimeout(500);
    await projectsPage.projectSettingLink.click();
    await page.waitForTimeout(3000);

    await expect(settingsPage.wrapper).toBeVisible();
    await expect(settingsPage.sidebar).toBeVisible();
  });

  test("General: should display sidebar tabs", async () => {
    await settingsPage.verifySidebarTabsVisible();
  });

  test("General: should display basic settings fields", async () => {
    test.setTimeout(30000);
    await expect(settingsPage.generalSettingsTitle).toBeVisible();
    await expect(settingsPage.projectNameLabel).toBeVisible();
    await expect(settingsPage.projectNameInput).toBeVisible();
    await expect(settingsPage.projectAliasLabel).toBeVisible();
    await expect(settingsPage.projectAliasInput).toBeVisible();
    await expect(settingsPage.projectDescriptionLabel).toBeVisible();
  });

  test("General: should display thumbnail section", async () => {
    await expect(settingsPage.thumbnailLabel).toBeVisible();
    await expect(settingsPage.thumbnailChooseButton).toBeVisible();
    await expect(settingsPage.thumbnailUploadButton).toBeVisible();
  });

  test("General: should display danger zone", async () => {
    await expect(settingsPage.dangerZoneTitle).toBeVisible();
    await expect(settingsPage.removeProjectTitle).toBeVisible();
    await expect(settingsPage.removeProjectDescription).toBeVisible();
    await expect(settingsPage.moveToRecycleBinButton).toBeVisible();
  });

  test("General: should show correct project name", async () => {
    await expect(settingsPage.projectNameInput).toHaveValue(projectName);
  });

  test("General: should show correct project alias", async () => {
    await expect(settingsPage.projectAliasInput).toHaveValue(projectAlias);
  });

  test("README: should navigate and display editor", async () => {
    test.setTimeout(30000);
    await settingsPage.navigateToReadmeTab();
    await expect(settingsPage.contentReadme).toBeVisible();
    await expect(settingsPage.readmeEditingTitle).toBeVisible();
  });

  test("README: should have Edit and Preview tabs", async () => {
    await expect(settingsPage.readmeEditTab).toBeVisible();
    await expect(settingsPage.readmePreviewTab).toBeVisible();
  });

  test("README: should have Save button", async () => {
    await expect(settingsPage.readmeSaveButton).toBeVisible();
  });

  test("README: should show textarea in edit mode", async () => {
    await expect(settingsPage.readmeTextarea).toBeVisible();
  });

  test("README: should switch to preview mode", async () => {
    await settingsPage.readmePreviewTab.click();
    await page.waitForTimeout(500);
    await expect(settingsPage.readmeTextarea).not.toBeVisible();
    await expect(page.locator(".markdown-body")).toBeVisible();
    await settingsPage.readmeEditTab.click();
    await page.waitForTimeout(500);
  });

  test("License: should navigate and display editor", async () => {
    test.setTimeout(30000);
    await settingsPage.navigateToLicenseTab();
    await expect(settingsPage.contentLicense).toBeVisible();
    await expect(settingsPage.licenseEditingTitle).toBeVisible();
  });

  test("License: should have Edit and Preview tabs", async () => {
    await expect(settingsPage.licenseEditTab).toBeVisible();
    await expect(settingsPage.licensePreviewTab).toBeVisible();
  });

  test("License: should have Save and Choose Template buttons", async () => {
    await expect(settingsPage.licenseSaveButton).toBeVisible();
    await expect(settingsPage.licenseChooseTemplateButton).toBeVisible();
  });

  test("License: should open template modal", async () => {
    test.setTimeout(30000);
    await settingsPage.licenseChooseTemplateButton.click();
    await page.waitForTimeout(1000);
    await expect(settingsPage.licenseTemplateModalTitle).toBeVisible();
    await expect(settingsPage.licenseTemplateApplyButton).toBeVisible();
    await expect(settingsPage.licenseTemplateCancelButton).toBeVisible();
    // Close the modal
    await settingsPage.licenseTemplateCancelButton.click();
    await page.waitForTimeout(500);
  });

  test("Story: should navigate and display settings", async () => {
    test.setTimeout(30000);
    await settingsPage.navigateToStoryTab();
    await expect(settingsPage.contentStory).toBeVisible();
    await expect(settingsPage.storyPanelSettingsTitle).toBeVisible();
  });

  test("Story: should display panel position selector", async () => {
    await expect(
      page.getByText("Panel Position", { exact: true })
    ).toBeVisible();
  });

  test("Story: should display background color field", async () => {
    await expect(settingsPage.storyBackgroundColorField).toBeVisible();
  });

  test("Public: should navigate and display settings", async () => {
    test.setTimeout(30000);
    // Public tab has sub-items (Scene/Story) that may already be visible.
    // Click the "Scene" sub-link directly to navigate to Public settings.
    const sceneLink = page.getByRole("link", { name: "Scene" });
    const isSceneVisible = await sceneLink
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!isSceneVisible) {
      // Sub-items not visible yet, click Public to expand first
      await settingsPage.tabPublic.click();
      await page.waitForTimeout(1000);
    }

    await sceneLink.click();
    await page.waitForTimeout(2000);
    await expect(settingsPage.contentPublic).toBeVisible();
  });

  test("Public: should display published page settings section", async () => {
    await expect(settingsPage.publicInfoTitle).toBeVisible();
  });

  test("Public: should display alias setting section", async () => {
    await expect(settingsPage.publicAliasSettingTitle).toBeVisible();
  });

  test("Public: should display basic authorization section", async () => {
    await expect(settingsPage.publicBasicAuthTitle).toBeVisible();
    await expect(settingsPage.publicEnableBasicAuthSwitch).toBeVisible();
  });

  test("Public: should display Google Analytics section", async () => {
    await expect(settingsPage.publicGoogleAnalyticsTitle).toBeVisible();
    await expect(settingsPage.publicEnableGASwitch).toBeVisible();
  });

  test("Assets: should navigate and display content", async () => {
    test.setTimeout(30000);
    await settingsPage.navigateToAssetsTab();
    await expect(settingsPage.contentAssets).toBeVisible();
  });

  test("Cleanup: Move project to recycle bin from settings", async () => {
    test.setTimeout(60000);
    await settingsPage.navigateToGeneralTab();
    await page.waitForTimeout(1000);
    await settingsPage.moveToRecycleBinButton.click();
    await page.waitForTimeout(1000);

    // Confirm the removal in the modal
    const confirmButton = page.getByRole("button", { name: "Remove" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await page.waitForTimeout(3000);

    // Should navigate back to dashboard after removal
    await expect(page.getByTestId("sidebar-tab-projects-link")).toBeVisible({
      timeout: 15000
    });
  });
});
