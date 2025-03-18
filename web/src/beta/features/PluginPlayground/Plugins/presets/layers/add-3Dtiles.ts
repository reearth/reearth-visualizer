import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-3d-tiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-3d-tiles-plugin
name: Add 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-3d-tiles
    type: widget
    name: Add 3D Tiles
    description: Add 3D Tiles
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-3d-tiles",
  title: "layers-add-3d-tiles.js",
  sourceCode: `// Example of adding a layer with 3D Tiles data

// Define 3D Tiles
const layer3dTiles = {
  type: "simple", // Required
  data: {
    type: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/8b/cce097-2d4a-46eb-a98b-a78e7178dc30/13103_minato-ku_pref_2023_citygml_1_op_bldg_3dtiles_13103_minato-ku_lod2_no_texture/tileset.json", // URL of 3D Tiles
  },
  "3dtiles": { // Settings for the 3D Tiles style.
    pbr: false, //invalid Physically Based Rendering
    selectedFeatureColor: "red", // If you select a feature, it will change color
  },
};

// Add the 3D Tiles layer from the URL to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layer3dTiles);

// Enable Terrain
// Documentation on Viewer "overrideProperty" event: https://visualizer.developer.reearth.io/plugin-api/viewer/#overrideproperty
reearth.viewer.overrideProperty({
  terrain: {
    enabled: true,
  },
});

// Move the camera to the position where the CZML data is displayed.
// Documentation on Camera "flyTo" event: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 4.022965234428543,
    height: 1616.524859060678,
    lat: 35.67170282368589,
    lng: 139.7707144962995,
    pitch: -0.464517599879275,
    roll: 6.283168638897022,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);`
};

export const add3dTiles: PluginType = {
  id: "add-3d-tiles",
  files: [yamlFile, widgetFile]
};
