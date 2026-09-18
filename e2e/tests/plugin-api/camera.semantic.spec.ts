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
 * Prerequisite: plugin-api-setup project must have run (uploads zip, installs
 * widget, writes .auth/plugin-project.json). Triggered automatically via:
 *   npx playwright test --project=plugin-api
 */

import { CameraAssertions } from "@pages/cameraAssertions";
import { CesiumViewerPage } from "@pages/cesiumViewerPage";
import {
  PluginFixturePage,
  ProjectIds
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

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL ?? "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();

    // No GraphQL client needed — widget is already installed by plugin-api-setup
    pluginFixture = new PluginFixturePage(page);
    cesiumViewer = new CesiumViewerPage(page);
    cameraAssertions = new CameraAssertions(page);

    ids = PluginFixturePage.readSharedState();

    await pluginFixture.navigateToEditor(ids.sceneId);
    await cesiumViewer.waitForGlobeReady();
    await pluginFixture.waitForIframeReady("Set Tokyo");
    await cameraAssertions.resetToBaseline();
  });

  test.afterAll(async () => {
    await context.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  test.beforeEach(async () => {
    await cameraAssertions.resetToBaseline();
  });

  test("plugin widget iframe is mounted and buttons are reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-000"
    });

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
    await page.waitForTimeout(800);

    await cameraAssertions.expectViewCenterNear(35.681, 139.767, 2);
  });

  test("plugin flyTo arrives at Sydney after animation", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-CAM-002"
    });

    await pluginFixture.triggerFlyToSydney();

    await cameraAssertions.waitUntilNear(
      -33.87,
      151.21,
      2,
      process.env.CI ? 45_000 : 15_000
    );

    await cameraAssertions.expectViewCenterNear(-33.87, 151.21, 2);
  });
});
