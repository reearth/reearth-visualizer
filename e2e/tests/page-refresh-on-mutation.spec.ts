import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { CesiumViewerPage } from "../pages/cesiumViewerPage";
import { DashBoardPage } from "../pages/dashBoardPage";
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
const projectDescription = "Page Refresh on Mutation E2E Test";
const layerName = faker.string.alpha(8);

test.describe.configure({ mode: "serial" });

test.describe("Page refresh on mutation actions", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;
  let cesiumViewer: CesiumViewerPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);
    cesiumViewer = new CesiumViewerPage(page);

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

  test("Create a project for mutation refresh testing", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    await projectsPage.newProjectButton.click();
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      projectDescription
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Navigate to the project editor and wait for globe", async () => {
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
    await cesiumViewer.waitForGlobeReady();

    // Start tracking navigations after editor is fully loaded
    cesiumViewer.startNavigationTracking();
  });

  /* ---------------------------------------------------------------- */
  /*  Adding a Sketch Layer                                            */
  /* ---------------------------------------------------------------- */

  test("add a sketch layer should NOT remount the Cesium viewer", async () => {
    cesiumViewer.resetNavigationCount();
    const marker = await cesiumViewer.stampViewerMarker();
    const layersBefore = await cesiumViewer.getLayerCount();

    await projectScreen.createNewLayer(layerName);

    // Wait for the layer to appear in the list
    await projectScreen.verifyLayerAdded(layerName);

    const layersAfter = await cesiumViewer.getLayerCount();
    expect(layersAfter).toBe(layersBefore + 1);

    // The Cesium viewer should NOT have been remounted
    await cesiumViewer.expectViewerNotRemounted(marker);

    // No full-page navigation should have occurred
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  Toggling Globe Lighting                                          */
  /* ---------------------------------------------------------------- */

  test("toggling Globe Lighting should NOT remount the Cesium viewer", async () => {
    cesiumViewer.resetNavigationCount();
    await cesiumViewer.clickSceneItem("Globe");
    const marker = await cesiumViewer.stampViewerMarker();

    const { before, after } = await cesiumViewer.toggleSwitch(0);
    expect(after).not.toBe(before);

    await cesiumViewer.expectViewerNotRemounted(marker);
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  Toggling Globe Shadow                                            */
  /* ---------------------------------------------------------------- */

  test("toggling Globe Shadow should NOT remount the Cesium viewer", async () => {
    cesiumViewer.resetNavigationCount();
    await cesiumViewer.clickSceneItem("Globe");
    const marker = await cesiumViewer.stampViewerMarker();

    const { before, after } = await cesiumViewer.toggleSwitch(1);
    expect(after).not.toBe(before);

    await cesiumViewer.expectViewerNotRemounted(marker);
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  Toggling Globe Atmosphere                                        */
  /* ---------------------------------------------------------------- */

  test("toggling Globe Atmosphere should NOT remount the Cesium viewer", async () => {
    cesiumViewer.resetNavigationCount();
    await cesiumViewer.clickSceneItem("Globe");
    const marker = await cesiumViewer.stampViewerMarker();

    const { before, after } = await cesiumViewer.toggleSwitch(2);
    expect(after).not.toBe(before);

    await cesiumViewer.expectViewerNotRemounted(marker);
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  Placing a Marker on a Sketch Layer                               */
  /* ---------------------------------------------------------------- */

  test("placing a marker should NOT remount the Cesium viewer", async () => {
    test.setTimeout(60000);
    cesiumViewer.resetNavigationCount();

    // Select the sketch layer created earlier
    await projectScreen.clickLayer(layerName);
    await projectScreen.addNewLayerStyle();

    const marker = await cesiumViewer.stampViewerMarker();

    // Place a marker point on the map
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      ),
      projectScreen.addPointsOnMap(400, 400)
    ]);

    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      data: {
        addGeoJSONFeature: {
          id: expect.any(String),
          type: "Feature"
        }
      }
    });

    // Viewer should NOT have remounted
    await cesiumViewer.expectViewerNotRemounted(marker);

    // The sketch layer should STILL be selected (no UI state loss)
    const layerItem = projectScreen.getLayerByName(layerName);
    const isStillHighlighted = await layerItem.evaluate((el) => {
      const bg = getComputedStyle(el)
        .backgroundColor.replace(/\s+/g, "")
        .toLowerCase();
      // Check it's not transparent (literal or rgba with 0 alpha)
      return !(
        bg === "transparent" ||
        bg === "rgba(0,0,0,0)" ||
        /^rgba?\(\d+,\d+,\d+,0(\.0+)?\)$/.test(bg)
      );
    });
    expect(isStillHighlighted).toBe(true);

    // No full-page navigation should have occurred
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  Updating a Layer Style property value                            */
  /* ---------------------------------------------------------------- */

  test("changing Point Size in Layer Style should NOT remount the Cesium viewer", async () => {
    cesiumViewer.resetNavigationCount();

    // Open the style editor for the layer
    await projectScreen.clickLayer(layerName);
    await projectScreen.editLayerStyleButton.click();
    await page.waitForTimeout(500);

    const marker = await cesiumViewer.stampViewerMarker();

    // Find the Point Size input
    const pointSizeInput = page
      .getByTestId("style-node-content-pointSize")
      .locator("input");
    const originalValue = await pointSizeInput.inputValue();

    // Change the value
    await pointSizeInput.click({ clickCount: 3 });
    await pointSizeInput.fill("25");
    await pointSizeInput.press("Enter");

    // Save the layer style
    await projectScreen.saveLayerStyleButton.click();
    await cesiumViewer.waitForLoaderToDisappear();

    // Viewer should NOT have remounted
    await cesiumViewer.expectViewerNotRemounted(marker);

    // Reopen the style editor to verify the value was persisted
    await projectScreen.editLayerStyleButton.click();
    await page.waitForTimeout(500);
    const savedValue = await page
      .getByTestId("style-node-content-pointSize")
      .locator("input")
      .inputValue();
    expect(savedValue).toBe("25");
    expect(savedValue).not.toBe(originalValue);

    // No full-page navigation should have occurred
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  Rapid successive mutations should NOT cause flicker              */
  /* ---------------------------------------------------------------- */

  test("rapid successive mutations should NOT remount the Cesium viewer", async () => {
    cesiumViewer.resetNavigationCount();
    await cesiumViewer.clickSceneItem("Globe");
    const marker = await cesiumViewer.stampViewerMarker();

    // Toggle Globe Lighting OFF then ON
    await cesiumViewer.getSwitch(0).click();
    await cesiumViewer.waitForLoaderToDisappear();
    await cesiumViewer.getSwitch(0).click();
    await cesiumViewer.waitForLoaderToDisappear();

    // Toggle Globe Shadow ON then OFF
    await cesiumViewer.getSwitch(1).click();
    await cesiumViewer.waitForLoaderToDisappear();
    await cesiumViewer.getSwitch(1).click();
    await cesiumViewer.waitForLoaderToDisappear();

    // Viewer should NOT have remounted at any point
    await cesiumViewer.expectViewerNotRemounted(marker);

    // No full-page navigation should have occurred
    cesiumViewer.expectNoPageNavigation();
  });

  /* ---------------------------------------------------------------- */
  /*  No full page navigation across all mutation types                */
  /* ---------------------------------------------------------------- */

  test("combined mutations should not trigger a full page navigation", async () => {
    test.setTimeout(60000);
    cesiumViewer.resetNavigationCount();

    // Mutation 1: Toggle Globe Lighting
    await cesiumViewer.clickSceneItem("Globe");
    await cesiumViewer.getSwitch(0).click();
    await cesiumViewer.waitForLoaderToDisappear();

    // Mutation 2: Add a new sketch layer
    const navTestLayerName = faker.string.alpha(8);
    await projectScreen.createNewLayer(navTestLayerName);

    // No full-page navigations should have occurred
    cesiumViewer.expectNoPageNavigation();
  });
});
