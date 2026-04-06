import { Locator, Page, expect } from "@playwright/test";

export class CesiumViewerPage {
  readonly resiumContainer: Locator;
  readonly canvas: Locator;
  readonly cesiumViewer: Locator;
  private navigationCount = 0;
  private navigationTracking = false;
  private navigationHandler: ((frame: unknown) => void) | null = null;

  constructor(private page: Page) {
    this.resiumContainer = this.page.locator(
      '[data-testid="resium-container"]'
    );
    this.canvas = this.resiumContainer.locator("canvas");
    this.cesiumViewer = this.resiumContainer.locator(".cesium-viewer");
  }

  startNavigationTracking() {
    // Remove previous listener to avoid duplicates
    if (this.navigationHandler) {
      this.page.removeListener("framenavigated", this.navigationHandler);
    }
    this.navigationCount = 0;
    this.navigationTracking = true;
    this.navigationHandler = (frame: unknown) => {
      if (this.navigationTracking && frame === this.page.mainFrame()) {
        this.navigationCount++;
      }
    };
    this.page.on("framenavigated", this.navigationHandler);
  }

  resetNavigationCount() {
    this.navigationCount = 0;
  }

  expectNoPageNavigation() {
    expect(this.navigationCount).toBe(0);
  }

  async waitForGlobeReady() {
    await this.canvas.waitFor({ state: "attached", timeout: 30_000 });
    await this.page.waitForTimeout(3000);
  }

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

  async isViewerStillMounted(marker: string): Promise<boolean> {
    return this.page.evaluate((m) => {
      const viewer = document.querySelector(
        `[data-testid="resium-container"] .cesium-viewer[data-mount-marker="${m}"]`
      );
      return viewer !== null;
    }, marker);
  }

  async expectViewerNotRemounted(marker: string) {
    const stillMounted = await this.isViewerStillMounted(marker);
    expect(stillMounted).toBe(true);
  }

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

  async clickSceneItem(label: string) {
    await this.page
      .locator('[data-testid="editor-map-scene-item"]')
      .filter({ hasText: label })
      .click();
    await this.page.waitForTimeout(500);
  }

  async getLayerCount(): Promise<number> {
    return this.page.locator('[data-testid="layer-item"]').count();
  }

  async waitForLoaderToDisappear(timeout = 30_000) {
    const loader = this.page.getByTestId("loader");
    await this.page.waitForTimeout(300);
    await loader.waitFor({ state: "hidden", timeout }).catch(() => {
      // Loader may never appear if the mutation is very fast
    });
  }

  getSwitch(index: number): Locator {
    return this.page.locator('[role="switch"]').nth(index);
  }

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
