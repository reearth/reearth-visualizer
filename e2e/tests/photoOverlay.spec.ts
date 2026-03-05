import path from "path";

import { faker } from "@faker-js/faker";
import { test, expect, BrowserContext, Page } from "@playwright/test";

import { STORAGE_STATE } from "../global-setup";
import { DashBoardPage } from "../pages/dashBoardPage";
import { PhotoOverlayPage } from "../pages/photoOverlayPage";
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
const projectAlias = faker.string.alpha(20);
const projectDescription = "Photo Overlay E2E Test";
const layerName = faker.string.alpha(5);

test.describe.configure({ mode: "serial" });

test.describe("Photo Overlay Feature", () => {
  let context: BrowserContext;
  let page: Page;
  let dashBoardPage: DashBoardPage;
  let projectsPage: ProjectsPage;
  let projectScreen: ProjectScreenPage;
  let photoOverlay: PhotoOverlayPage;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL || "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();
    dashBoardPage = new DashBoardPage(page);
    projectsPage = new ProjectsPage(page);
    projectScreen = new ProjectScreenPage(page);
    photoOverlay = new PhotoOverlayPage(page);

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
    await context.close();
  });

  test("Create a project for Photo Overlay testing", async () => {
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

  test("Navigate to the project editor", async () => {
    await projectsPage.goToProjectPage(projectName);
    await expect(projectScreen.newLayerButton).toBeVisible();
  });

  test("Create a sketch layer with a point style", async () => {
    test.setTimeout(60000);
    await projectScreen.createNewLayer(layerName);
    await projectScreen.verifyLayerAdded(layerName);
    await projectScreen.clickLayer(layerName);
    await projectScreen.addNewLayerStyle();
  });

  test("Add a marker point on the map", async () => {
    test.setTimeout(60000);
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
          type: "Feature",
          properties: {
            type: "marker",
            id: expect.any(String)
          }
        }
      }
    });

    await photoOverlay.verifyNoCrash();
  });

  test("Enable Photo Overlay on the sketch layer", async () => {
    test.setTimeout(60000);
    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(1000);
    await photoOverlay.goToPhotoOverlaySettingsTab();
    const switchEl = page.getByTestId("switcher");
    await expect(switchEl).toBeVisible();
    await switchEl.click();
    await page.waitForTimeout(3000);
    await photoOverlay.verifyNoCrash();
  });

  test("Select a feature and verify Photo Overlay section", async () => {
    test.setTimeout(90000);
    await photoOverlay.selectFeatureAndOpenInspector(400, 400);
    await expect(page.getByText("Photo Overlay").first()).toBeVisible();
    await photoOverlay.verifyNoCrash();
  });

  test("Open Photo Overlay Editor and verify panel", async () => {
    test.setTimeout(60000);
    await photoOverlay.openPhotoOverlayEditor();
    await expect(photoOverlay.editorPanel).toBeVisible();
    await expect(photoOverlay.assetChooseButton).toBeVisible();
    await expect(photoOverlay.assetUploadButton).toBeVisible();
    await expect(photoOverlay.editorCancelButton).toBeVisible();
    await expect(photoOverlay.editorSubmitButton).toBeVisible();

    await photoOverlay.verifyNoCrash();
  });

  test("Upload an image and submit the Photo Overlay", async () => {
    test.setTimeout(90000);
    const testImagePath = path.resolve(__dirname, "../test-data/testimage.jpg");
    await photoOverlay.uploadAsset(testImagePath);
    await expect(photoOverlay.editorPanel).toBeVisible();
    await photoOverlay.verifyNoCrash();
    await photoOverlay.setTransparency(50);
    await photoOverlay.photoDescriptionTextarea.fill("E2E test photo overlay");
    await page.waitForTimeout(500);
    await photoOverlay.submitPhotoOverlay();
    await page.waitForTimeout(2000);
    await photoOverlay.verifyNoCrash();
  });

  test("Re-select feature and verify editor fields", async () => {
    test.setTimeout(90000);
    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(2000);
    await photoOverlay.selectFeatureAndOpenInspector(400, 400);
    await expect(photoOverlay.editPhotoOverlayButton).toBeVisible();
    await photoOverlay.openPhotoOverlayEditor();
    await expect(photoOverlay.editorPanel).toBeVisible();
    await expect(photoOverlay.transparencyPanel).toBeVisible();
    await expect(photoOverlay.assetChooseButton).toBeVisible();
    await expect(photoOverlay.assetUploadButton).toBeVisible();
    await expect(photoOverlay.photoDescriptionTextarea).toBeVisible();
    await expect(photoOverlay.editorCancelButton).toBeVisible();
    await expect(photoOverlay.editorSubmitButton).toBeVisible();
    await photoOverlay.cancelPhotoOverlay();
    await photoOverlay.verifyNoCrash();
  });

  test.skip("Switch between size modes and verify width slider", async () => {
    test.setTimeout(90000);
    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(2000);
    await photoOverlay.selectFeatureAndOpenInspector(400, 400);
    await photoOverlay.openPhotoOverlayEditor();
    await expect(photoOverlay.editorPanel).toBeVisible();

    // Default mode is Contain - width slider should be hidden
    await photoOverlay.verifyPhotoSizeSliderHidden();

    // Switch to Fixed mode and verify width slider appears
    await photoOverlay.selectSizeType("Fixed");
    await photoOverlay.verifyPhotoSizeSliderVisible();

    // Switch back to Contain mode and verify width slider disappears
    await photoOverlay.selectSizeType("Contain");
    await photoOverlay.verifyPhotoSizeSliderHidden();

    await photoOverlay.cancelPhotoOverlay();
    await photoOverlay.verifyNoCrash();
  });

  test("Set transparency to edge values", async () => {
    test.setTimeout(90000);
    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(2000);
    await photoOverlay.selectFeatureAndOpenInspector(400, 400);
    await photoOverlay.openPhotoOverlayEditor();

    // Set transparency to 0 (fully transparent)
    await photoOverlay.setTransparency(0);
    await photoOverlay.verifyNoCrash();

    // Set transparency to 100 (fully opaque)
    await photoOverlay.setTransparency(100);
    await photoOverlay.verifyNoCrash();

    await photoOverlay.cancelPhotoOverlay();
    await photoOverlay.verifyNoCrash();
  });

  test("Cancel editor closes panel without saving", async () => {
    test.setTimeout(90000);
    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(2000);
    await photoOverlay.selectFeatureAndOpenInspector(400, 400);
    await photoOverlay.openPhotoOverlayEditor();
    await expect(photoOverlay.editorPanel).toBeVisible();

    // Upload an image and add description
    const testImagePath = path.resolve(__dirname, "../test-data/testimage.jpg");
    await photoOverlay.uploadAsset(testImagePath);
    await photoOverlay.photoDescriptionTextarea.fill("Should not be saved");
    await page.waitForTimeout(500);

    // Cancel and verify editor closes
    await photoOverlay.cancelPhotoOverlay();
    await expect(photoOverlay.editorPanel).not.toBeVisible();
    await photoOverlay.verifyNoCrash();

    // Reopen the editor to verify that the cancelled text was not saved
    await photoOverlay.selectFeatureAndOpenInspector(400, 400);
    await photoOverlay.openPhotoOverlayEditor();
    await expect(photoOverlay.editorPanel).toBeVisible();
    // The cancelled description "Should not be saved" must not appear
    await expect(photoOverlay.photoDescriptionTextarea).not.toHaveValue(
      "Should not be saved"
    );
    await photoOverlay.cancelPhotoOverlay();
  });

  test("Add second marker and open photo overlay editor", async () => {
    test.setTimeout(120000);
    await projectScreen.clickLayer(layerName);
    await page.waitForTimeout(1000);

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/graphql") &&
          (r.request().postData()?.includes("addGeoJSONFeature") ?? false),
        { timeout: 45000 }
      ),
      projectScreen.addPointsOnMap(600, 300)
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
    await photoOverlay.verifyNoCrash();

    // Select the second feature and open editor
    await photoOverlay.selectFeatureAndOpenInspector(600, 300);
    await photoOverlay.openPhotoOverlayEditor();
    await expect(photoOverlay.editorPanel).toBeVisible();
    await expect(photoOverlay.assetUploadButton).toBeVisible();
    await photoOverlay.cancelPhotoOverlay();
    await photoOverlay.verifyNoCrash();
  });
});
