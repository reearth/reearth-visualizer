import { Locator, Page, expect } from "@playwright/test";

export class CesiumViewerPage {
  readonly resiumContainer: Locator;
  readonly canvas: Locator;
  readonly cesiumViewer: Locator;
  private navigationCount = 0;
  private navigationTracking = false;

  constructor(private page: Page) {
    this.resiumContainer = this.page.locator(
      '[data-testid="resium-container"]'
    );
    this.canvas = this.resiumContainer.locator("canvas");
    this.cesiumViewer = this.resiumContainer.locator(".cesium-viewer");
  }

  /**
   * Start tracking full-page navigations.
   * Call once after the editor page has fully loaded.
   */
  startNavigationTracking() {
    this.navigationCount = 0;
    this.navigationTracking = true;
    this.page.on("framenavigated", (frame) => {
      if (this.navigationTracking && frame === this.page.mainFrame()) {
        this.navigationCount++;
      }
    });
  }

  /**
   * Reset the navigation counter (call at the start of each test).
   */
  resetNavigationCount() {
    this.navigationCount = 0;
  }

  /**
   * Assert that no full-page navigation has occurred since the last reset.
   */
  expectNoPageNavigation() {
    expect(this.navigationCount).toBe(0);
  }
  /**
   * Wait until the Cesium globe canvas has rendered (tiles have loaded).
   */
  async waitForGlobeReady() {
    await this.canvas.waitFor({ state: "attached", timeout: 30_000 });
    await this.page.waitForTimeout(3000);
  }

  /**
   * Stamps a unique marker attribute on the Cesium viewer DOM node.
   * If the component remounts, this marker disappears — that is how
   * we detect an unwanted refresh.
   */
  async stampViewerMarker(): Promise<string> {
    const marker = `test-mount-${Date.now()}`;
    await this.page.evaluate((m) => {
      const viewer = document.querySelector(
        '[data-testid="resium-container"] .cesium-viewer'
      );
      if (viewer) viewer.setAttribute("data-mount-marker", m);
    }, marker);
    return marker;
  }

  /**
   * Returns true when the stamp still exists (i.e. component was NOT remounted).
   */
  async isViewerStillMounted(marker: string): Promise<boolean> {
    return this.page.evaluate((m) => {
      const viewer = document.querySelector(
        `[data-testid="resium-container"] .cesium-viewer[data-mount-marker="${m}"]`
      );
      return viewer !== null;
    }, marker);
  }

  /**
   * Assert that the Cesium viewer was NOT remounted since the marker was stamped.
   */
  async expectViewerNotRemounted(marker: string) {
    const stillMounted = await this.isViewerStillMounted(marker);
    expect(stillMounted).toBe(true);
  }

  /**
   * Click on the canvas at a relative position (percentage-based).
   */
  async clickOnCanvas(xPercent: number, yPercent: number) {
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(
        box.x + box.width * xPercent,
        box.y + box.height * yPercent
      );
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Click a Scene panel item by its visible label text.
   */
  async clickSceneItem(label: string) {
    await this.page
      .locator('[data-testid="editor-map-scene-item"]')
      .filter({ hasText: label })
      .click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Return the number of layers currently in the Layers panel.
   */
  async getLayerCount(): Promise<number> {
    return this.page.locator('[data-testid="layer-item"]').count();
  }

  /**
   * Wait for the cursor loader/spinner (data-testid="loader") to disappear.
   * This spinner follows the cursor during active API tasks (GraphQL mutations).
   */
  async waitForLoaderToDisappear(timeout = 30_000) {
    const loader = this.page.getByTestId("loader");
    // First, briefly wait for the loader to potentially appear
    await this.page.waitForTimeout(300);
    // Then wait until it's gone (hidden or detached)
    await loader.waitFor({ state: "hidden", timeout }).catch(() => {
      // loader may never appear if the mutation is very fast — that's fine
    });
  }

  /**
   * Get a switch (toggle) by its index in the current panel.
   */
  getSwitch(index: number): Locator {
    return this.page.locator('[role="switch"]').nth(index);
  }

  /**
   * Toggle a switch, wait for the spinner to disappear, and return whether its state changed.
   */
  async toggleSwitch(
    index: number
  ): Promise<{ before: string; after: string }> {
    const switchEl = this.getSwitch(index);
    const before = (await switchEl.getAttribute("aria-checked")) ?? "";
    await switchEl.click();
    await this.waitForLoaderToDisappear();
    const after = (await switchEl.getAttribute("aria-checked")) ?? "";
    return { before, after };
  }
}
