/**
 * Data Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies reearth.data.clientStorage inside the plugin sandbox:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → clientStorage.setAsync / getAsync / keysAsync / deleteAsync / dropStoreAsync
 *   → reearth.ui.postMessage back to the iframe (primary pass condition)
 *
 * The plugin runs one fixed sequence and sends every step's result back, so a
 * single click covers the whole round trip. The store is dropped before and
 * after the sequence, so reruns start clean.
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
  throw new Error("Missing required env variables for data.semantic.spec.ts");
}

type StorageResult = {
  error?: string;
  string?: unknown;
  number?: unknown;
  object?: unknown;
  missing?: unknown;
  keys?: string[];
  keysAfterDelete?: string[];
  keysAfterDrop?: string[];
};

test.describe.configure({ mode: "serial" });

test.describe("Data Plugin API — semantic (webkit)", () => {
  let context: BrowserContext | undefined;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;
  let result: StorageResult;

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
    await pluginFixture.waitForIframeReady("Data Storage Run");

    // One click runs the whole sequence; the tests below check its results.
    await pluginFixture.iframe
      .getByRole("button", { name: "Data Storage Run" })
      .click();
    const output = pluginFixture.iframe.locator("#data-storage-result");
    await expect(output).not.toBeEmpty();
    result = JSON.parse((await output.textContent()) ?? "{}") as StorageResult;
  });

  test.afterAll(async () => {
    // context is undefined when beforeAll failed before creating it
    await context?.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  test("plugin widget iframe is mounted and the storage button is reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-000"
    });

    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Data Storage Run" })
    ).toBeVisible();
    expect(result.error).toBeUndefined();
  });

  test("setAsync then getAsync returns the same string, number and object", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-001"
    });

    expect(result.string).toBe("hello");
    expect(result.number).toBe(42);
    expect(result.object).toEqual({ a: 1, nested: { b: [1, 2] } });
  });

  test("getAsync returns null for a key that was never set", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-002"
    });

    expect(result.missing).toBeNull();
  });

  test("keysAsync lists the stored keys", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-003"
    });

    expect(result.keys).toEqual(["e2e-number", "e2e-object", "e2e-string"]);
  });

  test("deleteAsync removes only the given key", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-004"
    });

    expect(result.keysAfterDelete).toEqual(["e2e-object", "e2e-string"]);
  });

  test("dropStoreAsync removes every key", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-005"
    });

    expect(result.keysAfterDrop).toEqual([]);
  });
});
