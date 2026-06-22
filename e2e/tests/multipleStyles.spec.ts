import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { CesiumViewerPage } from "../pages/cesiumViewerPage";
import { DashBoardPage } from "../pages/dashBoardPage";
import { LayerStylePanelPage } from "../pages/layerStylePanelPage";
import { ProjectScreenPage } from "../pages/projectScreenPage";
import { ProjectsPage } from "../pages/projectsPage";
import { createIAPContext } from "../utils/iap-auth";
import { deleteProjectByName } from "../utils/project-cleanup";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required variables.");
}

const projectName = faker.string.alpha(15);
const projectAlias = faker.string.alpha(20);
const layerName = faker.string.alpha(8);

test.describe.configure({ mode: "serial" });

test.describe("Multiple Style Assignment and Switching", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;
  let cesiumViewer: CesiumViewerPage;
  let stylePanel: LayerStylePanelPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);
    cesiumViewer = new CesiumViewerPage(page);
    stylePanel = new LayerStylePanelPage(page);

    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    try {
      await page.waitForSelector('[data-testid="sidebar-tab-projects-link"]', {
        timeout: 15000,
        state: "visible"
      });
    } catch (error) {
      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        throw new Error(
          "Authentication failed - redirected to login page. Check if STORAGE_STATE is valid."
        );
      }
      throw new Error(
        `Dashboard did not load properly. Current URL: ${currentUrl}. Error: ${error}`
      );
    }
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
    await deleteProjectByName(page.request, projectName);
    await context.close();
  });

  test("Create a project for style tests", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      "Multiple Styles E2E Test"
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
  });

  test("Navigate to editor and create a sketch layer", async () => {
    test.setTimeout(90000);
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
    await cesiumViewer.waitForGlobeReady();
    await projectScreen.createNewLayer(layerName);
    await projectScreen.verifyLayerAdded(layerName);
    await projectScreen.clickLayer(layerName);
  });

  test("Add an Empty style", async () => {
    await stylePanel.addPresetStyle("Empty");
    await expect(stylePanel.getStyleByName("Style.01")).toBeVisible({
      timeout: 10_000
    });
  });

  test("Add a Default style as second style", async () => {
    await stylePanel.addPresetStyle("Default");
    await expect(stylePanel.getStyleByName("Default.01")).toBeVisible({
      timeout: 10_000
    });
  });

  test("Add a Professional style as third style", async () => {
    await stylePanel.addPresetStyle("Professional");
    await expect(stylePanel.getStyleByName("Professional.01")).toBeVisible({
      timeout: 10_000
    });
  });

  test("Switch between styles by clicking style entries", async () => {
    await stylePanel.selectStyle("Style.01");
    await expect(stylePanel.interfaceTab).toBeVisible();

    await stylePanel.selectStyle("Default.01");
    await expect(stylePanel.nodeListScrollArea).toBeVisible();
  });

  test("Style editor shows Interface and Code tabs", async () => {
    await expect(stylePanel.interfaceTab).toBeVisible();
    await expect(stylePanel.codeTab).toBeVisible();
  });

  test("Switch to Code tab and back to Interface", async () => {
    await stylePanel.codeTab.click();
    await page.waitForTimeout(500);
    await stylePanel.interfaceTab.click();
    await page.waitForTimeout(500);
  });

  test("Rename a style via context menu", async () => {
    await stylePanel.renameStyle("Style.01", "Custom Style");
    await expect(stylePanel.getStyleByName("Custom Style")).toBeVisible();
  });

  test("Delete a style via context menu", async () => {
    await expect(
      stylePanel.getStyleByName("Professional.01")
    ).toBeVisible();

    await stylePanel.deleteStyle("Professional.01");

    await expect(
      stylePanel.getStyleByName("Professional.01")
    ).not.toBeVisible();
  });

  test("Styles persist after deselecting and reselecting layer", async () => {
    await expect(stylePanel.getStyleByName("Custom Style")).toBeVisible();
    await expect(stylePanel.getStyleByName("Default.01")).toBeVisible();

    await page.getByTestId("empty-space").click();
    await page.waitForTimeout(500);

    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(500);

    await expect(stylePanel.getStyleByName("Custom Style")).toBeVisible();
    await expect(stylePanel.getStyleByName("Default.01")).toBeVisible();
  });
});
