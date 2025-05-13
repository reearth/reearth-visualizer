import { FrameLocator, Locator, Page, expect } from "@playwright/test";

export class ProjectScreenPage {
  constructor(private page: Page) {}

  // Scene panel
  scenePanel: Locator = this.page.getByText("Scene");
  sceneItems: Locator = this.page.locator(
    '[data-testid="editor-map-scene-item"]'
  );
  getSceneItemByName = (name: string): Locator =>
    this.page.locator(
      `[data-testid="editor-map-scene-item"] div:has-text("${name}")`
    );

  // Layer panel
  layersPanel: Locator = this.page.getByText("Layers");
  newLayerButton: Locator = this.page.getByRole("button", {
    name: "New Layer"
  });
  layerItems: Locator = this.page.locator('[data-testid="layer-item"]');
  getLayerItemByName = (name: string): Locator =>
    this.page.locator(`[data-testid="layer-item"] div:has-text("${name}")`);

  // Visualizer canvas
  viewerCanvas: Locator = this.page.locator("canvas");

  // Property iframe (Extension Property box)
  extensionIframe: FrameLocator = this.page.frameLocator(
    'iframe[data-testid="iframe"]'
  );
  extensionText: Locator = this.extensionIframe.locator("#text");
  extensionImage: Locator = this.extensionIframe.locator("#img");

  // Toolbar controls
  toolbarButtons: Locator = this.page.locator(
    '[data-testid="editor-map-tools-panel"] button'
  );

  async verifySceneItemExists(name: string) {
    await expect(this.getSceneItemByName(name)).toBeVisible();
  }

  async verifyLayerExists(name: string) {
    await expect(this.getLayerItemByName(name)).toBeVisible();
  }

  async readExtensionText(): Promise<string> {
    return (await this.extensionText.textContent()) ?? "";
  }

  async clickNewLayer() {
    await this.newLayerButton.click();
  }

  async getCanvasSize(): Promise<{ width: number; height: number }> {
    const box = await this.viewerCanvas.boundingBox();
    return {
      width: Math.floor(box?.width ?? 0),
      height: Math.floor(box?.height ?? 0)
    };
  }
}
