import { Locator, Page, TestInfo, expect } from "@playwright/test";

type SnapshotOptions = {
  maxDiffPixelRatio?: number;
  maxDiffPixels?: number;
  threshold?: number;
};

/**
 * Visual regression assertions for the Cesium canvas.
 *
 * stabilizeScene() must be called once in beforeAll (no testInfo needed).
 * waitForCanvasStable() accepts optional testInfo for failure diagnostics.
 * expectCanvasMatchesSnapshot() requires testInfo (from a test() callback).
 *
 * Snapshots capture only the Cesium canvas, not the full editor UI.
 *
 * IMPORTANT: These assertions must run under the Chromium project with a GPU
 * runner. WebGL pixels differ across GPU/browser combinations — webkit is
 * not suitable for pixel comparison baselines.
 *
 * maxDiffPixelRatio is intentionally absent. Calibrate it after running the
 * suite ~20 times on CI and observing real diff values, then set it in
 * playwright.config.ts under the chromium-visual project.
 */
export class CesiumVisualAssertions {
  private canvas: Locator;

  constructor(private page: Page) {
    this.canvas = page
      .locator('[data-testid="resium-container"] canvas')
      .first();
  }

  /**
   * Disables Sky animation and freezes the Timeline clock.
   * Without this, canvas screenshots differ per frame due to star motion
   * and sun position changes, making pixel comparison unreliable.
   *
   * Call once in beforeAll, after the editor and plugin widget have loaded.
   */
  async stabilizeScene(): Promise<void> {
    await this.page.evaluate(() => {
      const w = window as {
        reearth?: {
          timeline?: {
            setTime?: (t: { current: string }) => void;
            stop?: () => void;
          };
        };
        cesiumViewer?: { clock?: { shouldAnimate?: boolean } };
      };

      if (w.reearth?.timeline?.stop) {
        w.reearth.timeline.stop();
      }
      if (w.reearth?.timeline?.setTime) {
        w.reearth.timeline.setTime({ current: "2024-01-01T12:00:00Z" });
      }

      // Fallback: freeze Cesium clock directly if the viewer is exposed
      if (w.cesiumViewer?.clock) {
        w.cesiumViewer.clock.shouldAnimate = false;
      }
    });

    // Disable Sky via Scene panel UI (Sky animates regardless of clock state)
    try {
      const skyItem = this.page
        .locator('[data-testid="editor-map-scene-item"]')
        .filter({ hasText: "Sky" });
      if (await skyItem.isVisible({ timeout: 5000 })) {
        await skyItem.click();
        await this.page.waitForTimeout(500);
        // Toggle visibility switch inside the expanded Sky section
        const skyToggle = this.page.locator('[role="switch"]').first();
        if (await skyToggle.isVisible({ timeout: 3000 })) {
          const checked = await skyToggle.getAttribute("aria-checked");
          if (checked === "true") {
            await skyToggle.click();
            await this.page.waitForTimeout(300);
          }
        }
        // Collapse Sky section
        await skyItem.click();
        await this.page.waitForTimeout(300);
      }
    } catch {
      // Sky toggle failed — canvas stability loop will compensate
    }
  }

  /**
   * Polls canvas screenshots until 3 consecutive frames are pixel-identical.
   * Uses totalTimeout so the check adapts to CI machine speed.
   *
   * On failure, attaches the last captured frame to the test report when
   * testInfo is provided (not available in beforeAll, only in test/beforeEach).
   */
  async waitForCanvasStable(
    totalTimeoutMs = 30_000,
    testInfo?: TestInfo
  ): Promise<Buffer> {
    const deadline = Date.now() + totalTimeoutMs;
    let prev: Buffer | null = null;
    let sameCount = 0;

    while (Date.now() < deadline) {
      await this.page.waitForTimeout(500);
      const current = await this.canvas.screenshot();

      if (prev && Buffer.compare(prev, current) === 0) {
        sameCount++;
        if (sameCount >= 2) return current; // 3 consecutive identical frames
      } else {
        sameCount = 0;
      }
      prev = current;
    }

    if (prev && testInfo) {
      await testInfo.attach("canvas-last-frame-before-timeout", {
        body: prev,
        contentType: "image/png"
      });
    }
    throw new Error(
      `Cesium canvas did not stabilize within ${totalTimeoutMs}ms`
    );
  }

  /**
   * Waits for canvas stability then asserts the canvas matches a named snapshot.
   *
   * Attaches the captured frame to the test report (always, for baseline review).
   * Snapshots are namespaced by Playwright per project automatically.
   *
   * Must be called from within a test() callback (testInfo is per-test context).
   */
  async expectCanvasMatchesSnapshot(
    snapshotName: string,
    testInfo: TestInfo,
    options: SnapshotOptions = {}
  ): Promise<void> {
    const canvasBuffer = await this.waitForCanvasStable(
      process.env.CI ? 90_000 : 30_000,
      testInfo
    );
    await testInfo.attach(snapshotName.replace(/\.png$/, ""), {
      body: canvasBuffer,
      contentType: "image/png"
    });
    expect(canvasBuffer).toMatchSnapshot(snapshotName, options);
  }
}
