import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { CesiumViewerPage } from "../pages/cesiumViewerPage";
import { DashBoardPage } from "../pages/dashBoardPage";
import { DataSourceManagerPage } from "../pages/dataSourceManagerPage";
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

test.describe.configure({ mode: "serial" });

test.describe("Adding Layers from External Resources", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;
  let cesiumViewer: CesiumViewerPage;
  let dataSourceManager: DataSourceManagerPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);
    cesiumViewer = new CesiumViewerPage(page);
    dataSourceManager = new DataSourceManagerPage(page);

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

  async function openDataSourceManager() {
    await projectScreen.newLayerButton.click();
    await page.waitForTimeout(500);
    await projectScreen.addLayerFromResourceButton.click();
    await dataSourceManager.waitForOpen();
  }

  test("Create a project for external layer tests", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      "External Layers E2E Test"
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
  });

  test("Navigate to editor and wait for globe", async () => {
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
    await cesiumViewer.waitForGlobeReady();
  });

  test("Open Data Source Manager and verify all tabs", async () => {
    await openDataSourceManager();
    await dataSourceManager.verifyAllTabs();
    await dataSourceManager.close();
  });

  test("Add a GeoJSON layer from web URL", async () => {
    test.setTimeout(60000);
    const layersBefore = await cesiumViewer.getLayerCount();

    await openDataSourceManager();
    await dataSourceManager.addGeoJsonFromUrl(
      "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/JPN.geo.json"
    );
    await cesiumViewer.waitForLoaderToDisappear();
    await dataSourceManager.waitForClosed();

    const layersAfter = await cesiumViewer.getLayerCount();
    expect(layersAfter).toBe(layersBefore + 1);
  });

  test("Add a GeoJSON layer from inline value", async () => {
    test.setTimeout(60000);
    const layersBefore = await cesiumViewer.getLayerCount();

    await openDataSourceManager();
    await dataSourceManager.addGeoJsonFromValue(
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [139.6917, 35.6895] },
            properties: { name: "Tokyo" }
          }
        ]
      })
    );
    await cesiumViewer.waitForLoaderToDisappear();
    await dataSourceManager.waitForClosed();

    const layersAfter = await cesiumViewer.getLayerCount();
    expect(layersAfter).toBe(layersBefore + 1);
  });

  test("Add a 3D Tiles layer (Cesium OSM)", async () => {
    test.setTimeout(60000);
    const layersBefore = await cesiumViewer.getLayerCount();

    await openDataSourceManager();
    await dataSourceManager.threeDTilesTab.click();
    await page.waitForTimeout(300);

    await expect(dataSourceManager.cesiumOsmRadio).toBeVisible();
    await expect(dataSourceManager.googlePhotorealisticRadio).toBeVisible();

    await dataSourceManager.addToLayerButton.click();
    await cesiumViewer.waitForLoaderToDisappear();
    await dataSourceManager.waitForClosed();

    const layersAfter = await cesiumViewer.getLayerCount();
    expect(layersAfter).toBe(layersBefore + 1);
  });

  test("Add a 3D Tiles layer from URL", async () => {
    test.setTimeout(60000);
    const layersBefore = await cesiumViewer.getLayerCount();

    await openDataSourceManager();
    await dataSourceManager.addThreeDTilesFromUrl(
      "https://assets.cms.plateau.reearth.io/assets/11/6a69e4-0363-4138-a8ae-170069a8682e/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13101_chiyoda-ku_lod2_no_texture/tileset.json"
    );
    await cesiumViewer.waitForLoaderToDisappear();
    await dataSourceManager.waitForClosed();

    const layersAfter = await cesiumViewer.getLayerCount();
    expect(layersAfter).toBe(layersBefore + 1);
  });

  test("Verify all added layers are listed", async () => {
    const layerCount = await cesiumViewer.getLayerCount();
    expect(layerCount).toBeGreaterThanOrEqual(4);
  });

  test("Canceling Data Source Manager does not add a layer", async () => {
    const layersBefore = await cesiumViewer.getLayerCount();

    await openDataSourceManager();
    await dataSourceManager.close();

    const layersAfter = await cesiumViewer.getLayerCount();
    expect(layersAfter).toBe(layersBefore);
  });
});
