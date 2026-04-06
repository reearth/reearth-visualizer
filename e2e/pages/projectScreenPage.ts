import { Locator, Page, expect } from "@playwright/test";

export class ProjectScreenPage {
  scenePanel: Locator;
  sceneItems: Locator;
  layersPanel: Locator;
  newLayerButton: Locator;
  addSketchLayerButton: Locator;
  addLayerFromResourceButton: Locator;
  layerNameInput: Locator;
  newCustomPropertyButton: Locator;
  customPropertyTitleInput: Locator;
  customPropertyTypeSelect: Locator;
  createNewLayerButton: Locator;
  cancelNewLayerButton: Locator;
  addNewStyleButton: Locator;
  assignNewStyleButton: Locator;
  emptyState: Locator;
  defaultState: Locator;
  professionalState: Locator;
  basicGeometryState: Locator;
  pointsState: Locator;
  pointWithLabelState: Locator;
  polylineState: Locator;
  polygonState: Locator;
  extrudedPolygonState: Locator;
  threeDTilesState: Locator;
  geoJsonState: Locator;
  plateauState: Locator;
  inspectorSourceWrapper: Locator;
  sketchToolsPanel: Locator;
  sketchToolsWrapper: Locator;
  drawFeatureButtons: Locator;
  mapPinButton: Locator;
  polylineButton: Locator;
  circleButton: Locator;
  squareButton: Locator;
  polygonButton: Locator;
  cylinderButton: Locator;
  cubeButton: Locator;
  extrudeButton: Locator;
  sketchToolsDivider: Locator;
  editFeatureButtons: Locator;
  editButton: Locator;
  deleteButton: Locator;
  editorWrapper: Locator;
  editorMapLeftArea: Locator;
  layersPanelWrapper: Locator;
  layersContainer: Locator;
  stylePanelWrapper: Locator;
  nodeListScrollArea: Locator;
  editLayerStyleButton: Locator;
  saveLayerStyleButton: Locator;
  cancelLayerStyleButton: Locator;

  constructor(private page: Page) {
    this.scenePanel = this.page.getByText("Scene");
    this.sceneItems = this.page.locator(
      '[data-testid="editor-map-scene-item"]'
    );
    this.layersPanel = this.page.getByText("Layers");
    this.newLayerButton = this.page.getByTestId("new-layer-button");
    this.addSketchLayerButton = this.page.getByRole("menuitem", {
      name: "Add Sketch Layer"
    });
    this.addLayerFromResourceButton = this.page.getByRole("menuitem", {
      name: "Add Layer from Resource"
    });
    this.layerNameInput = this.page
      .getByTestId("sketch-layer-creator-name-input")
      .locator("input");
    this.newCustomPropertyButton = this.page.getByTestId(
      "new-property-button"
    );
    this.customPropertyTitleInput =
      this.page.getByPlaceholder("Type Title here");
    this.customPropertyTypeSelect = this.page
      .getByTestId("property-table-body")
      .getByTestId("select-input");
    this.createNewLayerButton = this.page.getByTestId(
      "sketch-layer-creator-create-btn"
    );
    this.cancelNewLayerButton = this.page.getByTestId(
      "sketch-layer-creator-cancel-btn"
    );
    this.addNewStyleButton = this.page.getByTestId("icon-button-plus");
    this.assignNewStyleButton = this.page.getByTestId("icon-button-return");
    this.emptyState = this.page.getByRole("menuitem", { name: "Empty" });
    this.defaultState = this.page.getByRole("menuitem", { name: "Default" });
    this.professionalState = this.page.getByRole("menuitem", {
      name: "Professional"
    });
    this.basicGeometryState = this.page.getByTestId(
      "preset-style-basic-geometry-item-3"
    );
    this.pointsState = this.page.getByTestId("preset-style-points-item-0");
    this.pointWithLabelState = this.page.getByText("Point with label");
    this.polylineState = this.page.getByText("Polyline");
    this.polygonState = this.page.getByText("Polygon");
    this.extrudedPolygonState = this.page.getByText("Extruded polygon");
    this.threeDTilesState = this.page.getByText("3D Tiles");
    this.geoJsonState = this.page.getByRole("menuitem", {
      name: "GeoJSON"
    });
    this.plateauState = this.page.getByRole("menuitem", {
      name: "Plateau"
    });
    this.inspectorSourceWrapper = this.page.getByTestId(
      "data-source-wrapper"
    );
    this.sketchToolsPanel = this.page.getByTestId("editor-map-tools-panel");
    this.sketchToolsWrapper = this.page.getByTestId("sketch-tools-wrapper");
    this.drawFeatureButtons = this.page.getByTestId(
      "sketch-feature-buttons-draw"
    );
    this.mapPinButton = this.page.getByTestId("icon-button-mapPin");
    this.polylineButton = this.page.getByTestId("icon-button-polyline");
    this.circleButton = this.page.getByTestId("icon-button-circle");
    this.squareButton = this.page.getByTestId("icon-button-square");
    this.polygonButton = this.page.getByTestId("icon-button-polygon");
    this.cylinderButton = this.page.getByTestId("icon-button-cylinder");
    this.cubeButton = this.page.getByTestId("icon-button-cube");
    this.extrudeButton = this.page.getByTestId("icon-button-extrude");
    this.sketchToolsDivider = this.page.getByTestId("sketch-tools-divider");
    this.editFeatureButtons = this.page.getByTestId(
      "sketch-feature-buttons-edit"
    );
    this.editButton = this.page.getByTestId("icon-button-pencilLine");
    this.deleteButton = this.page.getByTestId("icon-button-trash");
    this.editorWrapper = this.page.getByTestId("editor-wrapper");
    this.editorMapLeftArea = this.page.getByTestId("editor-map-left-area");
    this.layersPanelWrapper = this.page.getByTestId("layers-panel-wrapper");
    this.layersContainer = this.page.getByTestId("layers-container");
    this.stylePanelWrapper = this.page.getByTestId("style-panel-wrapper");
    this.nodeListScrollArea = this.page.getByTestId("node-list-scroll-area");
    this.editLayerStyleButton = this.page.getByTestId(
      "edit-layer-style-button"
    );
    this.saveLayerStyleButton = this.page.getByTestId(
      "save-layer-style-button"
    );
    this.cancelLayerStyleButton = this.page.getByTestId(
      "cancel-layer-style-button"
    );
  }

  getSceneItemByName = (name: string): Locator =>
    this.page.locator(
      `[data-testid="editor-map-scene-item"] div:has-text("${name}")`
    );

  getLayerByName = (name: string): Locator =>
    this.page.getByTestId("layer-item").filter({ hasText: name });

  async createNewLayer(layerName: string) {
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(500);
    await this.newLayerButton.click();
    await this.page.waitForTimeout(500);
    await this.addSketchLayerButton.click();
    await this.layerNameInput.first().waitFor({ state: "visible" });
    await this.layerNameInput.first().fill(layerName);
    await this.createNewLayerButton.click();

    // Wait for the loader spinner to disappear after the mutation
    const loader = this.page.getByTestId("loader");
    await this.page.waitForTimeout(500);
    await loader
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => {});

    // Ensure the editor is still stable and the layer panel is ready
    await this.newLayerButton.waitFor({ state: "visible", timeout: 15_000 });
    await this.page.waitForTimeout(1000);
  }

  async selectPropertyType(propertyType: string) {
    await this.customPropertyTypeSelect.click();
    await this.page
      .getByRole("option", { name: propertyType, exact: true })
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
    await expect(layerItem).toBeVisible({ timeout: 10_000 });
    await layerItem.click();
    await this.page.waitForTimeout(500);
  }

  async addNewLayerStyle(maxAttempts = 3) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.addNewStyleButton.waitFor({
          state: "visible",
          timeout: 10_000
        });
        await this.page.waitForTimeout(500);
        await this.addNewStyleButton.click();
        await expect(this.basicGeometryState).toBeVisible({ timeout: 10_000 });
        await this.page.waitForTimeout(500);

        await this.basicGeometryState.hover();
        await this.page.waitForTimeout(500);

        const pointsVisible = await this.pointsState
          .first()
          .isVisible({ timeout: 3_000 })
          .catch(() => false);

        if (!pointsVisible) {
          await this.page.keyboard.press("Escape");
          await this.page.waitForTimeout(500);
          continue;
        }

        await this.pointsState.first().click();
        await this.page.waitForTimeout(500);

        await expect(this.assignNewStyleButton).toBeEnabled({ timeout: 5_000 });
        await this.assignNewStyleButton.click();
        await this.page.waitForTimeout(1000);
        return;
      } catch {
        if (attempt < maxAttempts - 1) {
          await this.page.keyboard.press("Escape");
          await this.page.waitForTimeout(1000);
        } else {
          throw new Error(
            "addNewLayerStyle failed after " + maxAttempts + " attempts"
          );
        }
      }
    }
  }

  async addPointsOnMap(x: number, y: number) {
    await this.mapPinButton.waitFor({ state: "visible", timeout: 10_000 });
    await this.page.waitForTimeout(500);
    await this.mapPinButton.click();
    await this.page.waitForTimeout(1500);

    const canvas = this.page.locator("canvas").first();
    await canvas.waitFor({ state: "visible", timeout: 10_000 });

    await canvas.click({
      position: { x, y },
      force: true
    });

    await this.page.waitForTimeout(2000);
  }

  async addPolylineOnMap(w: number, x: number, _y: number, _z: number) {
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

  async addPolygonOnMap(points: { x: number; y: number }[]) {
    await this.polygonButton.click();
    await this.page.waitForTimeout(1000);

    const canvas = this.page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });

    // Click each point in the polygon
    for (const point of points) {
      await canvas.click({ position: point, force: true });
      await this.page.waitForTimeout(500);
    }

    // Double-click the last point to close the polygon
    await canvas.dblclick({ position: points[points.length - 1], force: true });
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
