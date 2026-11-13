/**
 * Popup Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies the full plugin call chain:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → reearth.popup.show / postMessage / update / close
 *   → the popup surface iframe (.zushi-popup-surface-container) on the host page
 *     (primary pass condition)
 *
 * reearth.popup.on("close") is checked through the plugin iframe, which shows
 * how many close events the plugin received.
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
  throw new Error("Missing required env variables for popup.semantic.spec.ts");
}

test.describe.configure({ mode: "serial" });

test.describe("Popup Plugin API — semantic (webkit)", () => {
  let context: BrowserContext | undefined;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;

  const clickPlugin = (name: string) =>
    pluginFixture.iframe.getByRole("button", { name }).click();
  const popupFrameElement = () =>
    page.locator(".zushi-popup-surface-container iframe");
  const popupInner = () =>
    pluginFixture.popupIframe.getByRole("button", { name: "Popup Inner" });
  const closedCount = async () =>
    Number(
      await pluginFixture.iframe.locator("#popup-closed-count").textContent()
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
    await pluginFixture.waitForIframeReady("Popup Show");
  });

  test.afterAll(async () => {
    // context is undefined when beforeAll failed before creating it
    await context?.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  // Close is a no-op when no popup is open, so this is safe after every test.
  test.afterEach(async () => {
    await clickPlugin("Popup Close");
    await expect(popupInner()).toBeHidden();
  });

  test("plugin widget iframe is mounted and the popup buttons are reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-POP-000"
    });

    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Popup Show" })
    ).toBeVisible();
    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Popup Close" })
    ).toBeVisible();
  });

  test("popup.show renders the HTML in the popup surface", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-POP-001"
    });

    await clickPlugin("Popup Show");

    await expect(popupInner()).toBeVisible();
  });

  test("popup.postMessage delivers the message to the popup content", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-POP-002"
    });

    await clickPlugin("Popup Show");
    await expect(popupInner()).toBeVisible();
    await clickPlugin("Popup Post");

    await expect(
      pluginFixture.popupIframe.locator("#popup-received")
    ).toHaveText(JSON.stringify({ text: "hello popup" }));
  });

  test("popup.update changes the popup width", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-POP-003"
    });

    await clickPlugin("Popup Show");
    await expect(popupInner()).toBeVisible();
    await expect
      .poll(async () => (await popupFrameElement().boundingBox())?.width)
      .toBeCloseTo(300, -1);

    await clickPlugin("Popup Update");

    await expect
      .poll(async () => (await popupFrameElement().boundingBox())?.width)
      .toBeCloseTo(500, -1);
  });

  test("popup.close hides the popup and the plugin gets the close event", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-POP-004"
    });

    const before = await closedCount();
    await clickPlugin("Popup Show");
    await expect(popupInner()).toBeVisible();

    await clickPlugin("Popup Close");

    await expect(popupInner()).toBeHidden();
    await expect.poll(closedCount).toBe(before + 1);
  });
});
