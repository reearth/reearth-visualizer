/**
 * Viewer Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies the full plugin call chain:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → reearth.viewer.interactionMode.override
 *   → window.reearth.viewer getters (primary pass condition)
 *
 * It also reads the values the Viewer exposes without a plugin call
 * (env, viewport, tools), as the host page sees them.
 *
 * Prerequisite: plugin-api-setup project must have run (uploads zip, installs
 * widget, writes .auth/plugin-project.json). Triggered automatically via:
 *   npx playwright test --project=plugin-api
 */

import { CesiumViewerPage } from "@pages/cesiumViewerPage";
import { PluginFixturePage, ProjectIds } from "@pages/pluginFixturePage";
import { test, expect, BrowserContext, Page } from "@playwright/test";
import { createIAPContext } from "@utils/iap-auth";

import { STORAGE_STATE } from "@/global-setup";

const REEARTH_E2E_EMAIL = process.env.REEARTH_E2E_EMAIL;
const REEARTH_E2E_PASSWORD = process.env.REEARTH_E2E_PASSWORD;
const REEARTH_WEB_E2E_BASEURL = process.env.REEARTH_WEB_E2E_BASEURL;

if (!REEARTH_E2E_EMAIL || !REEARTH_E2E_PASSWORD || !REEARTH_WEB_E2E_BASEURL) {
  throw new Error("Missing required env variables for viewer.semantic.spec.ts");
}

type ViewerWindow = {
  reearth?: {
    viewer?: {
      env?: { inEditor?: boolean; isBuilt?: boolean };
      viewport?: { width?: number; height?: number; isMobile?: boolean };
      interactionMode?: { mode?: string };
      tools?: {
        cartographicToCartesian?: (
          lng: number,
          lat: number,
          height: number
        ) => [number, number, number] | undefined;
      };
    };
  };
};

test.describe.configure({ mode: "serial" });

test.describe("Viewer Plugin API — semantic (webkit)", () => {
  let context: BrowserContext;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;

  const clickButton = (name: string) =>
    pluginFixture.iframe.getByRole("button", { name }).click();

  const readMode = () =>
    page.evaluate(
      () =>
        (window as unknown as ViewerWindow).reearth?.viewer?.interactionMode
          ?.mode
    );

  test.beforeAll(async ({ browser }) => {
    context = await createIAPContext(browser, REEARTH_WEB_E2E_BASEURL ?? "", {
      storageState: STORAGE_STATE
    });
    page = await context.newPage();

    // No GraphQL client needed — widget is already installed by plugin-api-setup
    pluginFixture = new PluginFixturePage(page);
    cesiumViewer = new CesiumViewerPage(page);

    ids = PluginFixturePage.readSharedState();

    await pluginFixture.navigateToEditor(ids.sceneId);
    await cesiumViewer.waitForGlobeReady();
    await pluginFixture.waitForIframeReady("Viewer Mode Move");
  });

  test.afterAll(async () => {
    await context.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  test.beforeEach(async () => {
    await clickButton("Viewer Mode Default");
    await expect.poll(readMode).toBe("default");
  });

  test("plugin widget iframe is mounted and viewer buttons are reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-VWR-000"
    });

    for (const name of ["Viewer Mode Move", "Viewer Mode Default"]) {
      await expect(
        pluginFixture.iframe.getByRole("button", { name })
      ).toBeVisible();
    }
  });

  test("env reports the Editor, not a published page", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-VWR-001"
    });

    const env = await page.evaluate(
      () => (window as unknown as ViewerWindow).reearth?.viewer?.env
    );

    expect(env?.inEditor).toBe(true);
    expect(env?.isBuilt).toBe(false);
  });

  test("viewport has a real size", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-VWR-002"
    });

    const viewport = await page.evaluate(
      () => (window as unknown as ViewerWindow).reearth?.viewer?.viewport
    );

    expect(viewport?.width).toBeGreaterThan(0);
    expect(viewport?.height).toBeGreaterThan(0);
    expect(viewport?.isMobile).toBe(false);
  });

  test("tools.cartographicToCartesian converts lng/lat/height to ECEF", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-VWR-003"
    });

    // (0°, 0°, 0 m) is on the equator at the WGS84 semi-major axis.
    await expect
      .poll(async () => {
        const p = await page.evaluate(() =>
          (
            window as unknown as ViewerWindow
          ).reearth?.viewer?.tools?.cartographicToCartesian?.(0, 0, 0)
        );
        return p?.[0];
      })
      .toBeCloseTo(6378137, 0);

    const p = await page.evaluate(() =>
      (
        window as unknown as ViewerWindow
      ).reearth?.viewer?.tools?.cartographicToCartesian?.(0, 0, 0)
    );
    expect(p?.[1]).toBeCloseTo(0, 0);
    expect(p?.[2]).toBeCloseTo(0, 0);
  });

  test("plugin interactionMode.override switches the mode", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-VWR-004"
    });

    await clickButton("Viewer Mode Move");
    await expect.poll(readMode).toBe("move");

    await clickButton("Viewer Mode Default");
    await expect.poll(readMode).toBe("default");
  });
});
