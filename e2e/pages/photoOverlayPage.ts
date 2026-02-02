import { Locator, Page, expect } from "@playwright/test";

export class PhotoOverlayPage {
  constructor(private page: Page) {}

  photoOverlayTab: Locator = this.page.getByTestId("tab-photoOverlaySettings");
  featureInspectorTab: Locator = this.page.getByTestId("tab-featureInspector");
  editPhotoOverlayButton: Locator = this.page.getByTestId(
    "photooverlay-edit-btn"
  );
  editorPanel: Locator = this.page.getByTestId("photooverlay-editor-panel");
  editorCancelButton: Locator = this.page.getByTestId(
    "photooverlay-cancel-btn"
  );
  editorSubmitButton: Locator = this.page.getByTestId(
    "photooverlay-submit-btn"
  );
  assetChooseButton: Locator = this.page.getByTestId("assetfield-choose-btn");
  assetUploadButton: Locator = this.page.getByTestId("assetfield-upload-btn");
  transparencyPanel: Locator = this.page.getByTestId(
    "photooverlay-transparency-panel"
  );
  transparencySlider: Locator =
    this.transparencyPanel.locator(".rc-slider-handle");
  photoDescriptionTextarea: Locator = this.editorPanel.getByTestId(
    "textareafield-input"
  );
  canvas: Locator = this.page.locator("canvas").first();

  async clickOnCanvas(x: number, y: number) {
    await this.canvas.waitFor({ state: "visible" });
    await this.canvas.click({ position: { x, y }, force: true });
    await this.page.waitForTimeout(1000);
  }

  async goToPhotoOverlaySettingsTab() {
    await this.photoOverlayTab.click();
    await this.page.waitForTimeout(500);
  }

  async goToFeatureInspectorTab() {
    await this.featureInspectorTab.click();
    await this.page.waitForTimeout(500);
  }

  async openPhotoOverlayEditor() {
    await this.editPhotoOverlayButton.click();
    await this.editorPanel.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  async uploadAsset(filePath: string) {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.assetUploadButton.click()
    ]);
    await fileChooser.setFiles(filePath);
    await this.page.waitForTimeout(3000);
  }

  async setTransparency(percent: number) {
    await this.transparencySlider.waitFor({ state: "visible" });
    const rail = this.transparencyPanel.locator(".rc-slider");
    const box = await rail.boundingBox();
    if (!box) {
      throw new Error(
        `Failed to set transparency: slider rail bounding box is null for requested percent ${percent}.`
      );
    }
    const targetX = box.x + box.width * (percent / 100);
    const targetY = box.y + box.height / 2;
    await this.transparencySlider.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(targetX, targetY);
    await this.page.mouse.up();
    await this.page.waitForTimeout(500);
  }

  async submitPhotoOverlay() {
    await this.editorSubmitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async cancelPhotoOverlay() {
    await this.editorCancelButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyNoCrash() {
    const errorEl = this.page.getByText("Unexpected Application Error");
    await expect(errorEl).not.toBeVisible();
  }
}
