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
const projectName = faker.lorem.word(5);
const projectDescription = faker.lorem.sentence();
const layerName = faker.lorem.word(5);
const projectAlias = faker.lorem.word(5);
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
      waitUntil: "networkidle"
    });

    // Wait for dashboard to load and verify we're not on login page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Authentication failed - redirected to login page. Check if STORAGE_STATE is valid.');
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
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false)
      ),
      projectScreen.addPointsOnMap(110, 198)
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
});
