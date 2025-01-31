import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layer-style-3d-tiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layer-style-3d-tiles-plugin
name: Change 3D Tiles Style
version: 1.0.0
extensions:
  - id: layer-style-3d-tiles
    type: widget
    name: Change 3D Tiles Style
    description: Change 3D Tiles Style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layer-style-3d-tiles",
  title: "layer-style-3d-tiles.js",
  sourceCode: `// This example shows how to style 3D Tiles //

// Define a 3D Tiles layer
const sample3dTiles01 = {
  type: "simple", // Required
  data: {
    type: "3dtiles", // Data type: 3dtiles
    url: "https://assets.cms.plateau.reearth.io/assets/4a/c9fb39-9c97-4da6-af8f-e08751a2f269/14100_yokohama-shi_city_2023_citygml_1_op_bldg_3dtiles_14103_nishi-ku_lod2_no_texture/tileset.json", // URL of the 3D Tiles
  },
  "3dtiles": {
    // Styling settings for the 3D Tiles
    show: true, // Show or hide the tiles
    color: "#FFFAFA", // Set the color of the 3D Tiles
    pbr: false, // Enable or disable Physically Based Rendering
    selectedFeatureColor: "red", // Change the color of selected features
    shadows: "enabled", // Shadow options: "disabled" | "enabled" | "cast_only" | "receive_only"
  },
};

const sample3dTiles02 = {
  type: "simple",
  data: {
    type: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/13/c43a77-9e37-4b30-b60d-ea832a5ed8a5/14100_yokohama-shi_city_2023_citygml_1_op_bldg_3dtiles_14104_naka-ku_lod2_no_texture/tileset.json",
  },
  "3dtiles": {
    selectedFeatureColor: "red",
    showWireframe: true, // Display the 3D Tiles in wireframe mode
  },
};

// Add the 3D Tiles layers to Re:Earth
reearth.layers.add(sample3dTiles01);
reearth.layers.add(sample3dTiles02);

// Enable terrain and shadows
reearth.viewer.overrideProperty({
  terrain: {
    enabled: true,
  },
  globe:{
    depthTestAgainstTerrain:true,
  },
  scene: {
    shadow: {
      enabled: true,
    },
  },
});

// Move the camera to the specified position
reearth.camera.flyTo(
  {
    // Define the camera target position
    heading: 0.06045621086315478,
    height: 357.3669137797168,
    lat: 35.44594796504924,
    lng: 139.63230661883225,
    pitch: -0.38534510496423335,
    roll: 6.283177746194314,
  },
  {
    // Define the duration of the camera movement (in seconds)
    duration: 2.0,
  }
);`
};

export const layerStyle3dTiles: PluginType = {
  id: "layer-style-3d-tiles",
  title: "Change 3D Tiles Style",
  files: [widgetFile, yamlFile]
};
