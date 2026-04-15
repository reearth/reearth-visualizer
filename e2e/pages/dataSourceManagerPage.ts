import { Locator, Page, expect } from "@playwright/test";

export class DataSourceManagerPage {
  modalTitle: Locator;
  geojsonTab: Locator;
  csvTab: Locator;
  wmsTab: Locator;
  vectorTileTab: Locator;
  threeDTilesTab: Locator;
  czmlTab: Locator;
  kmlTab: Locator;
  addToLayerButton: Locator;
  fromWebRadio: Locator;
  fromValueRadio: Locator;
  geojsonUrlInput: Locator;
  geojsonValueInput: Locator;
  threeDTilesUrlRadio: Locator;
  threeDTilesUrlInput: Locator;
  cesiumOsmRadio: Locator;
  googlePhotorealisticRadio: Locator;

  constructor(private page: Page) {
    this.modalTitle = this.page.getByText("Data Source Manager");
    this.geojsonTab = this.page.getByRole("tab", { name: "GeoJSON" });
    this.csvTab = this.page.getByRole("tab", { name: "CSV" });
    this.wmsTab = this.page.getByRole("tab", { name: "WMS" });
    this.vectorTileTab = this.page.getByRole("tab", { name: /Vector Tile/i });
    this.threeDTilesTab = this.page.getByRole("tab", { name: "3D Tiles" });
    this.czmlTab = this.page.getByRole("tab", { name: "CZML" });
    this.kmlTab = this.page.getByRole("tab", { name: "KML" });
    this.addToLayerButton = this.page.getByRole("button", {
      name: "Add to Layer"
    });
    this.fromWebRadio = this.page.getByText("From Web", { exact: true });
    this.fromValueRadio = this.page.getByText("From Value", { exact: true });
    this.geojsonUrlInput = this.page.getByPlaceholder("Input Text");
    this.geojsonValueInput = this.page.getByPlaceholder("Input data here");
    this.threeDTilesUrlRadio = this.page.getByText("URL", { exact: true });
    this.threeDTilesUrlInput = this.page.getByPlaceholder("https://");
    this.cesiumOsmRadio = this.page.getByText("Cesium OSM 3D Tiles");
    this.googlePhotorealisticRadio = this.page.getByText(
      "Google Photorealistic 3D Tiles"
    );
  }

  async waitForOpen() {
    await expect(this.modalTitle).toBeVisible({ timeout: 10_000 });
  }

  async waitForClosed() {
    await expect(this.modalTitle).not.toBeVisible({ timeout: 10_000 });
  }

  async verifyAllTabs() {
    await expect(this.geojsonTab).toBeVisible();
    await expect(this.csvTab).toBeVisible();
    await expect(this.wmsTab).toBeVisible();
    await expect(this.vectorTileTab).toBeVisible();
    await expect(this.threeDTilesTab).toBeVisible();
    await expect(this.czmlTab).toBeVisible();
    await expect(this.kmlTab).toBeVisible();
  }

  async addGeoJsonFromUrl(url: string) {
    await this.geojsonTab.click();
    await this.page.waitForTimeout(300);
    await this.fromWebRadio.click();
    await this.page.waitForTimeout(300);
    await expect(this.geojsonUrlInput).toBeVisible();
    await this.geojsonUrlInput.fill(url);
    await this.addToLayerButton.click();
  }

  async addGeoJsonFromValue(json: string) {
    await this.geojsonTab.click();
    await this.page.waitForTimeout(300);
    await this.fromValueRadio.click();
    await this.page.waitForTimeout(300);
    await expect(this.geojsonValueInput).toBeVisible();
    await this.geojsonValueInput.fill(json);
    await this.addToLayerButton.click();
  }

  async addThreeDTilesCesiumOsm() {
    await this.threeDTilesTab.click();
    await this.page.waitForTimeout(300);
    await this.addToLayerButton.click();
  }

  async addThreeDTilesFromUrl(url: string) {
    await this.threeDTilesTab.click();
    await this.page.waitForTimeout(300);
    await this.threeDTilesUrlRadio.click();
    await this.page.waitForTimeout(300);
    await expect(this.threeDTilesUrlInput).toBeVisible();
    await this.threeDTilesUrlInput.fill(url);
    await this.addToLayerButton.click();
  }

  async close() {
    const modalHeader = this.modalTitle.locator("..");
    await modalHeader.locator("button").first().click();
    await this.waitForClosed();
  }
}
