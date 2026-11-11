/**
 * Engine Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies the values a plugin reads from the sandbox:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → reearth.engine.name / reearth.apiVersion
 *   → reearth.ui.postMessage back to the iframe (primary pass condition)
 *
 * It also reads the same values on the host page (window.reearth), so a
 * mismatch between what the host and the sandbox see is caught.
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
  throw new Error("Missing required env variables for engine.semantic.spec.ts");
}

type EngineWindow = {
  reearth?: {
    apiVersion?: string;
    engine?: { name?: string };
  };
};

type EngineInfo = { name?: string; apiVersion?: string };

test.describe.configure({ mode: "serial" });

test.describe("Engine Plugin API — semantic (webkit)", () => {
  let context: BrowserContext | undefined;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;

  const readHostEngine = () =>
    page.evaluate(() => {
      const r = (window as unknown as EngineWindow).reearth;
      return { name: r?.engine?.name, apiVersion: r?.apiVersion };
    });

  // Clicks the plugin button, then parses what the plugin sent back.
  const readPluginEngine = async (): Promise<EngineInfo> => {
    await pluginFixture.iframe
      .getByRole("button", { name: "Engine Info" })
      .click();
    const result = pluginFixture.iframe.locator("#engine-info-result");
    await expect(result).not.toBeEmpty();
    return JSON.parse((await result.textContent()) ?? "{}") as EngineInfo;
  };

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
    await pluginFixture.waitForIframeReady("Engine Info");
  });

  test.afterAll(async () => {
    // context is undefined when beforeAll failed before creating it
    await context?.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  test("plugin widget iframe is mounted and the engine button is reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-ENG-000"
    });

    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Engine Info" })
    ).toBeVisible();
  });

  test("engine.name is cesium on the host page", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-ENG-001"
    });

    await expect.poll(async () => (await readHostEngine()).name).toBe("cesium");
  });

  test("apiVersion is a semver string on the host page", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-ENG-002"
    });

    const { apiVersion } = await readHostEngine();
    expect(apiVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("the plugin sandbox sees the same engine.name and apiVersion", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-ENG-003"
    });

    const host = await readHostEngine();
    const fromPlugin = await readPluginEngine();

    expect(fromPlugin.name).toBe("cesium");
    expect(fromPlugin.name).toBe(host.name);
    expect(fromPlugin.apiVersion).toBe(host.apiVersion);
  });
});
