/**
 * Data Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies reearth.data.clientStorage inside the plugin sandbox:
 *   spec sends { action: "data-op", op, args } from the plugin iframe
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → clientStorage[op](...args)
 *   → reearth.ui.postMessage({ action: "data-op-result" }) back to the iframe
 *     (primary pass condition)
 *
 * The plugin runs one storage call per message, and each test does its own
 * steps, so a failure points at the call that broke. The store is dropped
 * before every test.
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

type OpReply = { value?: unknown; error?: string };

test.describe.configure({ mode: "serial" });

test.describe("Data Plugin API — semantic (webkit)", () => {
  let context: BrowserContext | undefined;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;
  let opId = 0;

  // Sends one clientStorage call to the plugin and waits for its reply.
  const callStorage = async (op: string, ...args: unknown[]) => {
    const reply = await pluginFixture.iframe.locator("body").evaluate(
      (_body, msg) =>
        new Promise<OpReply>((resolve) => {
          const onMessage = (e: MessageEvent) => {
            if (e.data?.action === "data-op-result" && e.data.id === msg.id) {
              window.removeEventListener("message", onMessage);
              resolve({ value: e.data.value, error: e.data.error });
            }
          };
          window.addEventListener("message", onMessage);
          parent.postMessage({ action: "data-op", ...msg }, "*");
        }),
      { id: ++opId, op, args }
    );
    expect(reply.error, `${op} failed`).toBeUndefined();
    return reply.value;
  };

  const storage = {
    set: (key: string, value: unknown) => callStorage("setAsync", key, value),
    // A missing key is null (localForage) or undefined; both mean "no value".
    get: async (key: string) => (await callStorage("getAsync", key)) ?? null,
    delete: (key: string) => callStorage("deleteAsync", key),
    keys: async () => ((await callStorage("keysAsync")) as string[]).sort(),
    drop: () => callStorage("dropStoreAsync")
  };

  const openEditor = async () => {
    await pluginFixture.navigateToEditor(ids.sceneId);
    await cesiumViewer.waitForGlobeReady();
    await pluginFixture.waitForIframeReady("Data Storage");
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

    await openEditor();
  });

  test.afterAll(async () => {
    // context is undefined when beforeAll failed before creating it
    await context?.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  test.beforeEach(async () => {
    await storage.drop();
  });

  test("plugin widget iframe is mounted and the storage widget is reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-000"
    });

    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Data Storage" })
    ).toBeVisible();
  });

  test("setAsync then getAsync returns the same string, number and object", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-001"
    });

    await storage.set("e2e-string", "hello");
    await storage.set("e2e-number", 42);
    await storage.set("e2e-object", { a: 1, nested: { b: [1, 2] } });

    expect(await storage.get("e2e-string")).toBe("hello");
    expect(await storage.get("e2e-number")).toBe(42);
    expect(await storage.get("e2e-object")).toEqual({
      a: 1,
      nested: { b: [1, 2] }
    });
  });

  test("getAsync returns no value (null or undefined) for a key that was never set", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-002"
    });

    expect(await storage.get("e2e-missing")).toBeNull();
  });

  test("keysAsync lists the stored keys", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-003"
    });

    await storage.set("e2e-b", 2);
    await storage.set("e2e-a", 1);

    expect(await storage.keys()).toEqual(["e2e-a", "e2e-b"]);
  });

  test("deleteAsync removes only the given key", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-004"
    });

    await storage.set("e2e-a", 1);
    await storage.set("e2e-b", 2);
    await storage.delete("e2e-a");

    expect(await storage.keys()).toEqual(["e2e-b"]);
    expect(await storage.get("e2e-a")).toBeNull();
  });

  test("dropStoreAsync removes every key and value", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-005"
    });

    await storage.set("e2e-a", 1);
    await storage.set("e2e-b", 2);
    await storage.drop();

    expect(await storage.keys()).toEqual([]);
    expect(await storage.get("e2e-a")).toBeNull();
  });

  test("stored data survives a page reload", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-DAT-006"
    });

    await storage.set("e2e-persist", { saved: true });

    await openEditor();

    expect(await storage.get("e2e-persist")).toEqual({ saved: true });
  });
});
