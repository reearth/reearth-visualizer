/**
 * Modal Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies the full plugin call chain:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → reearth.modal.show / postMessage / update / close
 *   → the modal surface iframe (.zushi-modal-surface-container) on the host page
 *     (primary pass condition)
 *
 * reearth.modal.on("close") is checked through the plugin iframe, which shows
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
  throw new Error("Missing required env variables for modal.semantic.spec.ts");
}

test.describe.configure({ mode: "serial" });

test.describe("Modal Plugin API — semantic (webkit)", () => {
  let context: BrowserContext | undefined;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;

  const clickPlugin = (name: string) => pluginFixture.clickWidgetButton(name);
  const modalInner = () =>
    pluginFixture.modalIframe.getByRole("button", { name: "Modal Inner" });
  // Closing clears the modal content, so also assert the surface is hidden.
  const expectModalClosed = async () => {
    await expect(modalInner()).toBeHidden();
    await expect(pluginFixture.modalFrameElement).toBeHidden();
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
    await pluginFixture.waitForIframeReady("Modal Show");
  });

  test.afterAll(async () => {
    // context is undefined when beforeAll failed before creating it
    await context?.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  // Close is a no-op when no modal is open, so this is safe after every test.
  test.afterEach(async () => {
    await clickPlugin("Modal Close");
    await expectModalClosed();
  });

  test("plugin widget iframe is mounted and the modal buttons are reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-MOD-000"
    });

    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Modal Show" })
    ).toBeVisible();
    await expect(
      pluginFixture.iframe.getByRole("button", { name: "Modal Close" })
    ).toBeVisible();
  });

  test("modal.show renders the HTML in the modal surface", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-MOD-001"
    });

    await clickPlugin("Modal Show");

    await expect(modalInner()).toBeVisible();
  });

  test("modal.postMessage delivers the message to the modal content", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-MOD-002"
    });

    await clickPlugin("Modal Show");
    await expect(modalInner()).toBeVisible();
    await clickPlugin("Modal Post");

    await expect(
      pluginFixture.modalIframe.locator("#modal-received")
    ).toHaveText(JSON.stringify({ text: "hello modal" }));
  });

  test("modal.update changes the modal width", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-MOD-003"
    });

    await clickPlugin("Modal Show");
    await expect(modalInner()).toBeVisible();
    await expect
      .poll(
        async () => (await pluginFixture.modalFrameElement.boundingBox())?.width
      )
      .toBeCloseTo(300, -1);

    await clickPlugin("Modal Update");

    await expect
      .poll(
        async () => (await pluginFixture.modalFrameElement.boundingBox())?.width
      )
      .toBeCloseTo(500, -1);
  });

  test("modal.close hides the modal and the plugin gets the close event", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-MOD-004"
    });

    const before = await pluginFixture.modalClosedCount();
    await clickPlugin("Modal Show");
    await expect(modalInner()).toBeVisible();

    await clickPlugin("Modal Close");

    await expectModalClosed();
    await expect.poll(() => pluginFixture.modalClosedCount()).toBe(before + 1);
  });

  test("clicking the background closes the modal when clickBgToClose is true", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-MOD-005"
    });

    const before = await pluginFixture.modalClosedCount();
    await clickPlugin("Modal Show");
    await expect(modalInner()).toBeVisible();

    await pluginFixture.clickModalBackground();

    await expectModalClosed();
    await expect.poll(() => pluginFixture.modalClosedCount()).toBe(before + 1);
  });
});
