import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { DashBoardPage } from "../pages/dashBoardPage";
import { ProjectScreenPage } from "../pages/projectScreenPage";
import { ProjectsPage } from "../pages/projectsPage";
import { createIAPContext } from "../utils/iap-auth";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;
if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required variables.");
}
const projectName = faker.string.alpha(15);
const projectDescription = faker.lorem.sentence();
const layerName = faker.string.alpha(5);
const projectAlias = faker.string.alpha(20);
test.describe.configure({ mode: "serial" });

test.describe("Project Management", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);

    await page.goto(REEARTH_WEB_E2E_BASEURL || "", {
      waitUntil: "domcontentloaded"
    });

    // Wait for dashboard to load and verify we're not on login page
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
    await context.close();
  });

  test("Verify dashboard is loaded", async () => {
    await expect(dashBoardPage.projects).toBeVisible();
    await expect(dashBoardPage.recycleBin).toBeVisible();
    await expect(dashBoardPage.pluginPlayground).toBeVisible();
    await expect(dashBoardPage.documentation).toBeVisible();
  });

  test("Verify project creation modal", async () => {
    await dashBoardPage.projects.click();
    await projectsPage.newProjectButton.click();
    await expect(projectsPage.modalTitle).toBeVisible();
    await expect(projectsPage.projectNameLabel).toBeVisible();
    await expect(projectsPage.descriptionLabel).toBeVisible();
    await expect(projectsPage.cancelButton).toBeVisible();
    await expect(projectsPage.applyButton).toBeVisible();
  });

  test("Create a new project and verify after its creation", async () => {
    await projectsPage.createNewProject(
      projectName,
      projectAlias,
      projectDescription
    );
    await expect(projectsPage.noticeBanner).toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test("Go to the newly created project", async () => {
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
    await expect(projectScreen.addNewStyleButton).toBeVisible();
  });

  test("Should add new layer and add points on the map", async () => {
    test.setTimeout(60000);
    await projectScreen.createNewLayer(layerName);
    await projectScreen.verifyLayerAdded(layerName);
    await projectScreen.clickLayer(layerName);
    await projectScreen.addNewLayerStyle();

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      ),
      projectScreen.addPointsOnMap(400, 400)
    ]);

    // Verify the GraphQL response
    const responseBody = await response.json();
    expect(responseBody).toMatchObject({
      data: {
        addGeoJSONFeature: {
          id: expect.any(String),
          type: "Feature",
          properties: {
            type: "marker",
            id: expect.any(String),
            extrudedHeight: expect.any(Number),
            positions: expect.any(Array)
          }
        }
      }
    });
  });

  test.skip("Should verify sketch tools are visible after adding style", async () => {
    test.setTimeout(60000);
    await projectScreen.verifySketchToolsVisible();
  });

  test.skip("Should draw a polyline on the map", async () => {
    test.setTimeout(90000);
    const polylineLayerName = faker.string.alpha(5);

    await projectScreen.createNewLayer(polylineLayerName);
    await projectScreen.verifyLayerAdded(polylineLayerName);
    await projectScreen.clickLayer(polylineLayerName);

    await projectScreen.addPolylineStyle();
    await page.waitForTimeout(1000);
    await page.locator("canvas").click({
      position: {
        x: 84,
        y: 224
      }
    });
    await page.locator("canvas").click({
      position: {
        x: 231,
        y: 225
      }
    });
    await page.locator("canvas").click({
      position: {
        x: 191,
        y: 299
      }
    });
    await page.locator("canvas").dblclick({
      position: {
        x: 100,
        y: 250
      }
    });
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      )
    ]);

    const responseBody = await response.json();
    expect(responseBody.data.addGeoJSONFeature).toBeDefined();
    expect(responseBody.data.addGeoJSONFeature.id).toBeDefined();
  });

  test.skip("Should draw a polygon on the map", async () => {
    test.setTimeout(90000);
    const polygonLayerName = faker.string.alpha(5);

    await projectScreen.createNewLayer(polygonLayerName);
    await projectScreen.verifyLayerAdded(polygonLayerName);
    await projectScreen.clickLayer(polygonLayerName);

    await projectScreen.addPolygonStyle();
    await page.waitForTimeout(1000);

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      ),
      projectScreen.addPolygonOnMap([
        { x: 350, y: 250 },
        { x: 450, y: 250 },
        { x: 450, y: 350 },
        { x: 350, y: 350 }
      ])
    ]);

    const responseBody = await response.json();
    expect(responseBody.data.addGeoJSONFeature).toBeDefined();
    expect(responseBody.data.addGeoJSONFeature.type).toBe("Feature");
  });

  test.skip("Should draw a circle on the map", async () => {
    test.setTimeout(90000);
    const circleLayerName = faker.string.alpha(5);

    await projectScreen.createNewLayer(circleLayerName);
    await projectScreen.verifyLayerAdded(circleLayerName);
    await projectScreen.clickLayer(circleLayerName);

    await projectScreen.addPolygonStyle();
    await page.waitForTimeout(1000);

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      ),
      projectScreen.addCircleOnMap({ x: 400, y: 400 }, { x: 450, y: 400 })
    ]);

    const responseBody = await response.json();
    expect(responseBody.data.addGeoJSONFeature).toBeDefined();
  });

  test.skip("Should draw a square on the map", async () => {
    test.setTimeout(90000);
    const squareLayerName = faker.string.alpha(5);

    await projectScreen.createNewLayer(squareLayerName);
    await projectScreen.verifyLayerAdded(squareLayerName);
    await projectScreen.clickLayer(squareLayerName);

    await projectScreen.addPolygonStyle();
    await page.waitForTimeout(1000);

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      ),
      projectScreen.addSquareOnMap({ x: 350, y: 350 }, { x: 450, y: 450 })
    ]);

    const responseBody = await response.json();
    expect(responseBody.data.addGeoJSONFeature).toBeDefined();
  });

  test("Should create layer with custom text property", async () => {
    test.setTimeout(60000);
    const customLayerName = faker.string.alpha(5);

    await projectScreen.createLayerWithCustomProperty(
      customLayerName,
      "Description",
      "Text"
    );
    await projectScreen.verifyLayerAdded(customLayerName);
  });

  test("Should create layer with custom number property", async () => {
    test.setTimeout(60000);
    const customLayerName = faker.string.alpha(5);

    await projectScreen.createLayerWithCustomProperty(
      customLayerName,
      "Count",
      "Int"
    );
    await projectScreen.verifyLayerAdded(customLayerName);
  });

  test.skip("Should navigate to Scene panel and verify scene items", async () => {
    test.setTimeout(60000);
    await projectScreen.scenePanel.click();
    await page.waitForTimeout(1000);

    await expect(projectScreen.getSceneItemByName("Main")).toBeVisible();
    await expect(projectScreen.getSceneItemByName("Tiles")).toBeVisible();
    await expect(projectScreen.getSceneItemByName("Terrain")).toBeVisible();
    await expect(projectScreen.getSceneItemByName("Globe")).toBeVisible();
    await expect(projectScreen.getSceneItemByName("Sky")).toBeVisible();
    await expect(projectScreen.getSceneItemByName("Camera")).toBeVisible();
  });
});
