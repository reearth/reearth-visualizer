/**
 * Timeline Plugin API — Semantic E2E tests (webkit)
 *
 * Verifies the full plugin call chain:
 *   plugin iframe button click
 *   → parent.postMessage
 *   → reearth.extension.on("message")
 *   → reearth.timeline.setSpeed / setStepType / setRangeType / setTime / play / pause
 *   → timeline manager
 *   → window.reearth.timeline getters (primary pass condition)
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
  throw new Error(
    "Missing required env variables for timeline.semantic.spec.ts"
  );
}

type TimelineState = {
  speed?: number;
  stepType?: string;
  rangeType?: string;
  isPlaying?: boolean;
  startTime?: number;
  stopTime?: number;
  currentTime?: number;
};

test.describe.configure({ mode: "serial" });

test.describe("Timeline Plugin API — semantic (webkit)", () => {
  let context: BrowserContext;
  let page: Page;
  let pluginFixture: PluginFixturePage;
  let cesiumViewer: CesiumViewerPage;
  let ids: ProjectIds;

  const clickButton = (name: string) =>
    pluginFixture.iframe.getByRole("button", { name }).click();

  // Reads the timeline as the host page sees it. Dates become epoch ms so they
  // survive serialization out of page.evaluate.
  const readTimeline = () =>
    page.evaluate((): TimelineState => {
      const t = (
        window as unknown as {
          reearth?: {
            timeline?: {
              speed?: number;
              stepType?: string;
              rangeType?: string;
              isPlaying?: boolean;
              startTime?: Date;
              stopTime?: Date;
              currentTime?: Date;
            };
          };
        }
      ).reearth?.timeline;
      return {
        speed: t?.speed,
        stepType: t?.stepType,
        rangeType: t?.rangeType,
        isPlaying: t?.isPlaying,
        startTime: t?.startTime?.getTime(),
        stopTime: t?.stopTime?.getTime(),
        currentTime: t?.currentTime?.getTime()
      };
    });

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
    await pluginFixture.waitForIframeReady("Timeline Speed 10x");
  });

  test.afterAll(async () => {
    await context.close().catch(() => {});
    // Shared project is deleted by plugin-api-teardown — nothing to clean up here.
  });

  test.beforeEach(async () => {
    // Keep the clock from running into the next test.
    await clickButton("Timeline Pause");
    await expect.poll(async () => (await readTimeline()).isPlaying).toBe(false);
  });

  test("plugin widget iframe is mounted and timeline buttons are reachable", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-TIM-000"
    });

    for (const name of [
      "Timeline Speed 10x",
      "Timeline Step Fixed",
      "Timeline Range Bounced",
      "Timeline Set Time",
      "Timeline Play",
      "Timeline Pause"
    ]) {
      await expect(
        pluginFixture.iframe.getByRole("button", { name })
      ).toBeVisible();
    }
  });

  test("plugin setSpeed changes the timeline speed", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-TIM-001"
    });

    await clickButton("Timeline Speed 10x");

    await expect.poll(async () => (await readTimeline()).speed).toBe(10);
  });

  test("plugin setStepType changes the step type", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-TIM-002"
    });

    await clickButton("Timeline Step Fixed");

    await expect
      .poll(async () => (await readTimeline()).stepType)
      .toBe("fixed");
  });

  test("plugin setRangeType changes the range type", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-TIM-003"
    });

    await clickButton("Timeline Range Bounced");

    await expect
      .poll(async () => (await readTimeline()).rangeType)
      .toBe("bounced");
  });

  test("plugin setTime sets the start, stop and current time", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-TIM-004"
    });

    await clickButton("Timeline Set Time");

    await expect
      .poll(async () => (await readTimeline()).startTime)
      .toBe(Date.parse("2024-01-01T00:00:00Z"));
    const state = await readTimeline();
    expect(state.stopTime).toBe(Date.parse("2024-01-02T00:00:00Z"));
    expect(state.currentTime).toBe(Date.parse("2024-01-01T06:00:00Z"));
  });

  test("plugin play starts the timeline and pause stops it", async () => {
    test.info().annotations.push({
      type: "story",
      description: "PLUGIN-TIM-005"
    });

    await clickButton("Timeline Play");
    await expect.poll(async () => (await readTimeline()).isPlaying).toBe(true);

    await clickButton("Timeline Pause");
    await expect.poll(async () => (await readTimeline()).isPlaying).toBe(false);
  });
});
