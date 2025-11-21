import { Locator, Page, expect } from "@playwright/test";

export class ProjectScreenPage {
  constructor(private page: Page) {}

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
  customPropertyTypeSelect: Locator = this.page
    .getByTestId("property-table-body")
    .getByTestId("select-input");
  createNewLayerButton: Locator = this.page.getByTestId(
    "sketch-layer-creator-create-btn"
  );
  cancelNewLayerButton: Locator = this.page.getByTestId(
    "sketch-layer-creator-cancel-btn"
  );
  addNewStyleButton: Locator = this.page.getByTestId("icon-button-plus");
  assignNewStyleButton: Locator = this.page.getByTestId("icon-button-return");

  emptyState: Locator = this.page.getByRole("menuitem", { name: "Empty" });
  defaultState: Locator = this.page.getByRole("menuitem", { name: "Default" });
  professionalState: Locator = this.page.getByRole("menuitem", {
    name: "Professional"
  });
  basicGeometryState: Locator = this.page.getByTestId(
    "preset-style-basic-geometry-item-3"
  );
  pointsState: Locator = this.page.getByTestId("preset-style-points-item-0");
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

  sketchToolsPanel: Locator = this.page.getByTestId("editor-map-tools-panel");
  sketchToolsWrapper: Locator = this.page.getByTestId("sketch-tools-wrapper");

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

  sketchToolsDivider: Locator = this.page.getByTestId("sketch-tools-divider");
  editFeatureButtons: Locator = this.page.getByTestId(
    "sketch-feature-buttons-edit"
  );
  editButton: Locator = this.page.getByTestId("icon-button-pencilLine");
  deleteButton: Locator = this.page.getByTestId("icon-button-trash");

  editorWrapper: Locator = this.page.getByTestId("editor-wrapper");
  editorMapLeftArea: Locator = this.page.getByTestId("editor-map-left-area");
  layersPanelWrapper: Locator = this.page.getByTestId("layers-panel-wrapper");
  layersContainer: Locator = this.page.getByTestId("layers-container");
  stylePanelWrapper: Locator = this.page.getByTestId("style-panel-wrapper");
  nodeListScrollArea: Locator = this.page.getByTestId("node-list-scroll-area");
  editLayerStyleButton: Locator = this.page.getByTestId(
    "edit-layer-style-button"
  );

  async createNewLayer(layerName: string) {
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(500);
    await this.newLayerButton.click();
    await this.page.waitForTimeout(500);
    await this.addSketchLayerButton.click();
    await this.layerNameInput.first().waitFor({ state: "visible" });
    await this.layerNameInput.first().fill(layerName);
    await this.createNewLayerButton.click();
    await this.page.waitForTimeout(3000);
  }

  async selectPropertyType(propertyType: string) {
    await this.customPropertyTypeSelect.click();
    await this.page.getByRole("option", { name: propertyType, exact: true }).click();
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
    await expect(this.basicGeometryState).toBeVisible();
    await this.basicGeometryState.hover();
    await expect(this.pointsState.first()).toBeVisible();
    await this.pointsState.first().click();
    await this.assignNewStyleButton.click();
  }

  async addPointsOnMap(x: number, y: number) {
    await this.mapPinButton.click();
    await this.page.waitForTimeout(1000);

    const canvas = this.page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });

    await canvas.click({
      position: { x, y },
      force: true
    });

    await this.page.waitForTimeout(2000);
  }

  async addPolylineOnMap(w: number, x: number, y: number, z: number) {
    await this.polylineButton.click();
    await this.page.waitForTimeout(1500);

    const canvas = this.page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });

    await this.page.waitForTimeout(500);
    await canvas.click({
      position: { x: w, y: x },
      force: true
    });
    await this.page.waitForTimeout(500);

    await this.page.waitForTimeout(2000);
  }

  async addCircleOnMap(
    center: { x: number; y: number },
    edge: { x: number; y: number }
  ) {
    await this.circleButton.click();
    await this.page.waitForTimeout(1000);

    const canvas = this.page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });

    await canvas.click({ position: center, force: true });
    await this.page.waitForTimeout(500);

    await canvas.click({ position: edge, force: true });
    await this.page.waitForTimeout(2000);
  }

  async addSquareOnMap(
    corner1: { x: number; y: number },
    corner2: { x: number; y: number }
  ) {
    await this.squareButton.click();
    await this.page.waitForTimeout(1000);

    const canvas = this.page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });

    await canvas.click({ position: corner1, force: true });
    await this.page.waitForTimeout(500);

    await canvas.click({ position: corner2, force: true });
    await this.page.waitForTimeout(2000);
  }

  async addPolylineStyle() {
    await this.addNewStyleButton.click();
    await expect(this.basicGeometryState).toBeVisible();
    await this.basicGeometryState.hover();
    await this.page.waitForTimeout(500);
    await this.polylineState.click();
    await this.assignNewStyleButton.click();
  }

  async addPolygonStyle() {
    await this.addNewStyleButton.click();
    await expect(this.basicGeometryState).toBeVisible();
    await this.basicGeometryState.hover();
    await this.page.waitForTimeout(500);
    await this.polygonState.first().click();
    await this.assignNewStyleButton.click();
  }

  async verifySketchToolsVisible() {
    await expect(this.sketchToolsWrapper).toBeVisible();
    await expect(this.mapPinButton).toBeVisible();
    await expect(this.polylineButton).toBeVisible();
    await expect(this.circleButton).toBeVisible();
    await expect(this.squareButton).toBeVisible();
    await expect(this.polygonButton).toBeVisible();
  }

  async createLayerWithCustomProperty(
    layerName: string,
    propertyTitle: string,
    propertyType: string
  ) {
    await this.newLayerButton.click();
    await this.addSketchLayerButton.click();
    await this.layerNameInput.first().fill(layerName);

    await this.newCustomPropertyButton.click();
    await this.customPropertyTitleInput.fill(propertyTitle);
    await this.selectPropertyType(propertyType);

    await this.createNewLayerButton.click();
    await this.page.waitForTimeout(1000);
  }
}
