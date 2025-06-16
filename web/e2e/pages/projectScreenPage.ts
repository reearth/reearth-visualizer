import { FrameLocator, Locator, Page, expect } from "@playwright/test";

export class ProjectScreenPage {
  constructor(private page: Page) {}

  // left sidebar
  scenePanel: Locator = this.page.getByText("Scene");
  sceneItems: Locator = this.page.locator(
    '[data-testid="editor-map-scene-item"]'
  );
  getSceneItemByName = (name: string): Locator =>
    this.page.locator(
      `[data-testid="editor-map-scene-item"] div:has-text("${name}")`
    );

  layersPanel: Locator = this.page.getByText("Layers");
  newLayerButton: Locator = this.page.getByTestId("new-layer-button");
  addSketchLayerButton: Locator = this.page.getByRole("menuitem", {
    name: "Add Sketch Layer"
  });
  getLayerByName = (name: string): Locator =>
    this.page.getByTestId("layer-item").filter({ hasText: name });
  addLayerFromResourceButton: Locator = this.page.getByRole("menuitem", {
    name: "Add Layer from Resource"
  });

  layerNameInput: Locator = this.page
    .getByTestId("sketch-layer-creator-name-input")
    .locator("input");
  newCustomPropertyButton: Locator = this.page.getByTestId(
    "new-property-button"
  );
  customPropertyTitleInput: Locator =
    this.page.getByPlaceholder("Type Title here");
  customPropertyTypeSelect: Locator = this.page.getByTestId("select-input");
  createNewLayerButton: Locator = this.page.getByTestId(
    "sketch-layer-creator-create-btn"
  );
  cancelNewLayerButton: Locator = this.page.getByTestId(
    "sketch-layer-creator-cancel-btn"
  );
  // right sidebar

  // addNewStyleButton: Locator = this.page.locator(
  //   'button:has([data-testid="icon-plus"])'
  // );
  addNewStyleButton: Locator = this.page.locator(".css-1pek4b9").first();

  assignNewStyleButton: Locator = this.page.locator(
    "div:nth-child(2) > .css-1pek4b9"
  );
  emptyState: Locator = this.page.getByRole("menuitem", { name: "Empty" });
  defaultState: Locator = this.page.getByRole("menuitem", { name: "Default" });
  professionalState: Locator = this.page.getByRole("menuitem", {
    name: "Professional"
  });
  basicGeometryState: Locator = this.page.getByRole("menuitem", {
    name: "Basic Geometry"
  });
  pointsState: Locator = this.page.getByText("Points");
  pointWithLabelState: Locator = this.page.getByText("Point with label");
  polylineState: Locator = this.page.getByText("Polyline");
  polygonState: Locator = this.page.getByText("Polygon");
  extrudedPolygonState: Locator = this.page.getByText("Extruded polygon");
  threeDTilesState: Locator = this.page.getByText("3D Tiles");

  geoJsonState: Locator = this.page.getByRole("menuitem", {
    name: "GeoJSON"
  });
  plateauState: Locator = this.page.getByRole("menuitem", {
    name: "Plateau"
  });
  inspectorSourceWrapper: Locator = this.page.getByTestId(
    "data-source-wrapper"
  );

  // Sketch Tools Panel
  sketchToolsPanel: Locator = this.page.getByTestId("editor-map-tools-panel");
  sketchToolsWrapper: Locator = this.page.getByTestId("sketch-tools-wrapper");

  // Draw feature buttons
  drawFeatureButtons: Locator = this.page.getByTestId(
    "sketch-feature-buttons-draw"
  );
  mapPinButton: Locator = this.page.getByTestId("icon-button-mapPin");
  polylineButton: Locator = this.page.getByTestId("icon-button-polyline");
  circleButton: Locator = this.page.getByTestId("icon-button-circle");
  squareButton: Locator = this.page.getByTestId("icon-button-square");
  polygonButton: Locator = this.page.getByTestId("icon-button-polygon");
  cylinderButton: Locator = this.page.getByTestId("icon-button-cylinder");
  cubeButton: Locator = this.page.getByTestId("icon-button-cube");
  extrudeButton: Locator = this.page.getByTestId("icon-button-extrude");

  // Edit feature buttons
  sketchToolsDivider: Locator = this.page.getByTestId("sketch-tools-divider");
  editFeatureButtons: Locator = this.page.getByTestId(
    "sketch-feature-buttons-edit"
  );
  editButton: Locator = this.page.locator(
    'button:has([data-testid="icon-pencilLine"])'
  );
  deleteButton: Locator = this.page.locator(
    'button:has([data-testid="icon-trash"])'
  );

  async createNewLayer(layerName: string) {
    await this.newLayerButton.click();
    await this.addSketchLayerButton.click();
    await this.layerNameInput.first().fill(layerName);
    await this.createNewLayerButton.click();
  }

  async selectPropertyType(propertyType: string) {
    await this.customPropertyTypeSelect.click();
    await this.page
      .getByRole("option")
      .filter({ hasText: propertyType })
      .click();
  }
  async layerExists(layerName: string) {
    const layerItem = this.getLayerByName(layerName);
    return await layerItem.isVisible();
  }

  async verifyLayerAdded(layerName: string) {
    const layerItem = this.getLayerByName(layerName);
    await expect(layerItem).toBeVisible();
    await expect(layerItem).toContainText(layerName);
  }
  async clickLayer(layerName: string) {
    const layerItem = this.getLayerByName(layerName);
    await expect(layerItem).toBeVisible();
    await layerItem.click();
  }

  async addNewLayerStyle() {
    await this.addNewStyleButton.click();
    await expect(this.page.getByText("Empty")).toBeVisible();
    await this.basicGeometryState.hover();
    await this.pointsState.first().isVisible();
    await this.pointWithLabelState.first().isVisible();
    await this.polylineState.first().isVisible();
    await this.page.waitForTimeout(1000);
    await this.pointsState.first().click();
    await this.assignNewStyleButton.click();
    // await this.page.waitForTimeout(50000);
  }

  async addPointsOnMap(x: number, y: number) {
    await this.mapPinButton.click();
    await this.page.waitForTimeout(1000);
    const canvas = this.page.locator("canvas");
    await canvas.click({
      position: {
        x,
        y
      }
    });
    await this.page.waitForTimeout(2000);
  }
}
