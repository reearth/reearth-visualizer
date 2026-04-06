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
const projectDescription = "Layer Deletion & Reorder E2E Test";
const layerNames = [
  faker.string.alpha(8),
  faker.string.alpha(8),
  faker.string.alpha(8)
];

test.describe.configure({ mode: "serial" });

test.describe("Layer Deletion & Reordering", () => {
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

  test("Create a project for layer operations testing", async () => {
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
  });

  test("Add three sketch layers", async () => {
    test.setTimeout(90000);
    for (const name of layerNames) {
      await projectScreen.createNewLayer(name);
      await projectScreen.verifyLayerAdded(name);
    }

    const layerItems = page.getByTestId("layer-item");
    const count = await layerItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("Delete a layer via context menu", async () => {
    const layerItems = page.getByTestId("layer-item");
    const initialCount = await layerItems.count();

    const targetLayer = layerItems.filter({ hasText: layerNames[0] });
    await targetLayer.hover();
    await page.waitForTimeout(300);
    await targetLayer
      .getByTestId("icon-button-dotsThreeVertical")
      .click();
    await page.waitForTimeout(300);

    await page.getByRole("menuitem").filter({ hasText: "Delete" }).click();

    await expect(
      page.getByText("Delete this Layer?")
    ).toBeVisible({ timeout: 10_000 });
    await page
      .locator('button[appearance="dangerous"]')
      .filter({ hasText: "Delete" })
      .click();
    await cesiumViewer.waitForLoaderToDisappear();

    const newCount = await layerItems.count();
    expect(newCount).toBe(initialCount - 1);
  });

  test("Deleted layer is no longer in the list", async () => {
    const deletedLayer = projectScreen.getLayerByName(layerNames[0]);
    await expect(deletedLayer).not.toBeVisible();

    const layerItems = page.getByTestId("layer-item");
    const count = await layerItems.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Can select a layer after another was deleted", async () => {
    await projectScreen.clickLayer(layerNames[1]);
    await expect(page.getByText("Inspector")).toBeVisible();
  });

  test("Reorder layers via drag and drop", async () => {
    const layerItems = page.getByTestId("layer-item");
    const firstLayer = layerItems.filter({ hasText: layerNames[1] });
    const secondLayer = layerItems.filter({ hasText: layerNames[2] });

    const firstBox = await firstLayer.boundingBox();
    const secondBox = await secondLayer.boundingBox();
    if (!firstBox || !secondBox) {
      throw new Error("Could not get bounding boxes for layer items");
    }

    const dragHandle = firstLayer.locator(
      ".reearth-visualizer-editor-layers-drag-handle"
    );
    const handleBox = await dragHandle.boundingBox();
    const startX = handleBox
      ? handleBox.x + handleBox.width / 2
      : firstBox.x + 10;
    const startY = handleBox
      ? handleBox.y + handleBox.height / 2
      : firstBox.y + firstBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(300);
    await page.mouse.move(
      secondBox.x + secondBox.width / 2,
      secondBox.y + secondBox.height / 2,
      { steps: 10 }
    );
    await page.waitForTimeout(300);
    await page.mouse.up();
    await page.waitForTimeout(1000);

    const reorderedItems = page.getByTestId("layer-item");
    const firstText = await reorderedItems.first().textContent();
    const secondText = await reorderedItems.nth(1).textContent();
    expect(firstText).toContain(layerNames[2]);
    expect(secondText).toContain(layerNames[1]);
  });

  test("Rename a layer via context menu", async () => {
    const layerItems = page.getByTestId("layer-item");
    const targetLayer = layerItems.filter({ hasText: layerNames[1] });

    await targetLayer.hover();
    await page.waitForTimeout(300);
    await targetLayer
      .getByTestId("icon-button-dotsThreeVertical")
      .click();
    await page.waitForTimeout(300);
    await page.getByRole("menuitem").filter({ hasText: "Rename" }).click();
    await page.waitForTimeout(1000);

    const renameInput = layerItems.locator("input").first();
    await expect(renameInput).toBeVisible({ timeout: 10_000 });
    await renameInput.clear();
    await renameInput.fill("Renamed Layer");
    await renameInput.press("Enter");
    await cesiumViewer.waitForLoaderToDisappear();

    await expect(
      page.getByTestId("layer-item").filter({ hasText: "Renamed Layer" })
    ).toBeVisible();
  });

  test("Toggle layer visibility", async () => {
    const layerItems = page.getByTestId("layer-item");
    const targetLayer = layerItems.filter({ hasText: "Renamed Layer" });

    await targetLayer.click();
    await page.waitForTimeout(300);

    const eyeButton = targetLayer.getByTestId("icon-button-eye");
    await eyeButton.click();
    await cesiumViewer.waitForLoaderToDisappear();

    const eyeSlashButton = targetLayer.getByTestId("icon-button-eyeSlash");
    await expect(eyeSlashButton).toBeVisible();

    await eyeSlashButton.click();
    await cesiumViewer.waitForLoaderToDisappear();

    await expect(targetLayer.getByTestId("icon-button-eye")).toBeVisible();
  });

  test("Delete all remaining layers one by one", async () => {
    const layerItems = page.getByTestId("layer-item");
    let count = await layerItems.count();

    while (count > 0) {
      await layerItems.first().hover();
      await page.waitForTimeout(300);
      await layerItems.first()
        .getByTestId("icon-button-dotsThreeVertical")
        .click();
      await page.waitForTimeout(300);

      await page.getByRole("menuitem").filter({ hasText: "Delete" }).click();

      await expect(
        page.getByText("Delete this Layer?")
      ).toBeVisible({ timeout: 10_000 });
      await page
        .locator('button[appearance="dangerous"]')
        .filter({ hasText: "Delete" })
        .click();
      await cesiumViewer.waitForLoaderToDisappear();

      count = await layerItems.count();
    }

    expect(count).toBe(0);
  });

  test("Verify empty layer list and New Layer button is available", async () => {
    const layerItems = page.getByTestId("layer-item");
    const count = await layerItems.count();
    expect(count).toBe(0);

    await expect(projectScreen.newLayerButton).toBeVisible();
  });
});
