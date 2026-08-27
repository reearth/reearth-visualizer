/**
 * Camera Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies the full plugin call chain:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → reearth.camera.setView / flyTo
 *   → Cesium engine
 *   → getGlobeIntersection() (primary pass condition)
 *
 * These tests do NOT do pixel comparison (that is camera.visual.spec.ts).
 * They confirm the camera API renders the globe at the expected location.
 *
 * Prerequisite: plugin-api-setup project must have run (uploads shared zip,
 * writes .auth/plugin-project.json). Run together via:
 *   npx playwright test tests/plugin-api/ --project=plugin-api
 */

import { CameraAssertions } from "@pages/cameraAssertions";
import { CesiumViewerPage } from "@pages/cesiumViewerPage";
import {
  PluginFixturePage,
  ProjectIds,
  createPluginClient
} from "@pages/pluginFixturePage";
import { test, expect, BrowserContext, Page } from "@playwright/test";
import { createIAPContext } from "@utils/iap-auth";

import { STORAGE_STATE } from "@/global-setup";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required env variables for camera.semantic.spec.ts");
}

test.describe.configure({ mode: "serial" });

test.describe("Camera Plugin API — semantic (webkit)", () => {
  let context: BrowserContext;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let cameraAssertions: CameraAssertions;
  let ids: ProjectIds;
  let widgetId: string;

  test.beforeAll(async ({ browser, request }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL ?? "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();

    const client = createPluginClient(request);
    pluginFixture = new PluginFixturePage(page, client);
    cesiumViewer = new CesiumViewerPage(page);
    cameraAssertions = new CameraAssertions(page);

    // Read the shared project state written by plugin-api-setup
    ids = PluginFixturePage.readSharedState();

    // Add this suite's widget to the shared scene via UI, return its widgetId
    widgetId = await pluginFixture.addWidget(
      ids.sceneId,
      "Camera Test Widget",
      "camera-test"
    );

    // Navigate to the editor and wait for the globe and widget iframe
    await pluginFixture.navigateToEditor(ids.sceneId);
    await cesiumViewer.waitForGlobeReady();
    await pluginFixture.waitForIframeReady("Set Tokyo");

    // Establish a known camera baseline after the editor loads
    await cameraAssertions.resetToBaseline();
  });

  test.afterAll(async ({ request }) => {
    // Use afterAll's own request fixture — beforeAll's request cannot be reused here.
    // removeWidget only calls this.client, so page can be null.
    if (widgetId && ids?.sceneId) {
      const teardown = new PluginFixturePage(null as any, createPluginClient(request));
      await teardown.removeWidget(ids.sceneId, widgetId);
    }
    await context.close().catch(() => {});
    // Note: the shared project is deleted by plugin-api-teardown
  });

  test.beforeEach(async () => {
    // Reset to a known camera state before each test to prevent state bleed
    await cameraAssertions.resetToBaseline();
  });

  test("plugin widget iframe is mounted and buttons are reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-000"
    });

    // Smoke test: run first in serial mode so iframe mount failures produce
    // a clear message instead of confusing "button not found" errors downstream.
    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Set Tokyo" })
    ).toBeVisible();
    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Fly Sydney" })
    ).toBeVisible();
    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Zoom In" })
    ).toBeVisible();
  });

  test("plugin setView moves the camera to Tokyo", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-001"
    });

    await pluginFixture.triggerSetTokyo();

    // setView is instant — wait one frame for Cesium to apply the camera update
    await page.waitForTimeout(800);

    // Primary assertion: getGlobeIntersection proves the camera is actually
    // looking at Tokyo on the rendered globe (not just internal state)
    await cameraAssertions.expectViewCenterNear(35.681, 139.767, 2);
  });

  test("plugin flyTo arrives at Sydney after animation", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-002"
    });

    await pluginFixture.triggerFlyToSydney();

    // flyTo has a 1s animation — poll until position converges
    await cameraAssertions.waitUntilNear(
      -33.87,
      151.21,
      2,
      process.env.CI ? 45_000 : 15_000
    );

    await cameraAssertions.expectViewCenterNear(-33.87, 151.21, 2);
  });
});
