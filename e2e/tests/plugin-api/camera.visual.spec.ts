/**
 * Camera Plugin API — Visual snapshot tests (Chromium + GPU runner)
 *
 * Captures the Cesium canvas after each camera operation and compares
 * it to a stored baseline snapshot. This catches cases where the API
 * call succeeds at the state level but the 3D globe renders incorrectly.
 *
 * IMPORTANT: These tests MUST run under the "chromium-visual" Playwright
 * project (not webkit). WebGL pixels differ across GPU/browser combinations.
 * A fixed Docker image + GPU flag is required for reproducible baselines.
 *
 * To establish the initial baseline:
 *   npx playwright test --project=chromium-visual \
 *     tests/plugin-api/camera.visual.spec.ts --update-snapshots
 *
 * NOTE: Add the chromium-visual project to playwright.config.ts when the
 * GPU runner is available:
 *
 *   {
 *     name: "chromium-visual",
 *     testMatch: /tests\/plugin-api\/.*\.visual\.spec\.ts/,
 *     dependencies: ["plugin-api-setup"],
 *     use: {
 *       ...devices["Desktop Chrome"],
 *       headless: false,            // GPU rendering requires non-headless
 *       launchOptions: { args: ["--use-gl=egl"] },
 *       viewport: { width: 1920, height: 1080 },
 *       deviceScaleFactor: 1
 *     }
 *   }
 *
 * Prerequisite: plugin-api-setup project must have run (uploads zip, installs
 * widget, writes .auth/plugin-project.json). Triggered automatically via:
 *   npx playwright test --project=plugin-api
 */

import { CameraAssertions } from "@pages/cameraAssertions";
import { CesiumViewerPage } from "@pages/cesiumViewerPage";
import { CesiumVisualAssertions } from "@pages/cesiumVisualAssertions";
import {
  PluginFixturePage,
  ProjectIds
} from "@pages/pluginFixturePage";
import { test, BrowserContext, Page } from "@playwright/test";
import { createIAPContext } from "@utils/iap-auth";

import { STORAGE_STATE } from "@/global-setup";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required env variables for camera.visual.spec.ts");
}

test.describe.configure({ mode: "serial" });

test.describe("Camera Plugin API — visual snapshots (Chromium)", () => {
  let context: BrowserContext;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let cameraAssertions: CameraAssertions;
  let cesiumVisual: CesiumVisualAssertions;
  let ids: ProjectIds;

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL ?? "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();

    // No GraphQL client needed — widget is already installed by plugin-api-setup
    pluginFixture = new PluginFixturePage(page);
    cesiumViewer = new CesiumViewerPage(page);
    cameraAssertions = new CameraAssertions(page);
    cesiumVisual = new CesiumVisualAssertions(page);

    ids = PluginFixturePage.readSharedState();

    await pluginFixture.navigateToEditor(ids.sceneId);
    await cesiumViewer.waitForGlobeReady();
    await pluginFixture.waitForIframeReady("Set Tokyo");

    await cesiumVisual.stabilizeScene();
    await cameraAssertions.resetToBaseline();
    await cesiumVisual.waitForCanvasStable(process.env.CI ? 90_000 : 30_000);
  });

  test.afterAll(async () => {
    await context.close().catch(() => {});
  });

  test.beforeEach(async ({}, testInfo) => {
    await cameraAssertions.resetToBaseline();
    await cesiumVisual.waitForCanvasStable(
      process.env.CI ? 90_000 : 30_000,
      testInfo
    );
  });

  test("setView to Tokyo: canvas matches snapshot", async ({}, testInfo) => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-VIS-001"
    });

    await pluginFixture.triggerSetTokyo();
    await page.waitForTimeout(800);

    await cesiumVisual.expectCanvasMatchesSnapshot("camera-tokyo.png", testInfo);
  });

  test(
    "flyTo Sydney: canvas matches snapshot after animation",
    async ({}, testInfo) => {
      test.info().annotations.push({
        type: "story",
        description: "PLUGIN-CAM-VIS-002"
      });

      await pluginFixture.triggerFlyToSydney();
      await cameraAssertions.waitUntilNear(
        -33.87,
        151.21,
        2,
        process.env.CI ? 45_000 : 15_000
      );

      await cesiumVisual.expectCanvasMatchesSnapshot(
        "camera-sydney.png",
        testInfo
      );
    }
  );

  test("zoomIn: canvas matches snapshot", async ({}, testInfo) => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-VIS-003"
    });

    await pluginFixture.triggerZoomIn();
    await page.waitForTimeout(800);

    await cesiumVisual.expectCanvasMatchesSnapshot(
      "camera-zoom-in.png",
      testInfo
    );
  });
});
