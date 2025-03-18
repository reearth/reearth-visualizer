import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "style-with-condition-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: style-with-condition-plugin
name: Style With Condition
version: 1.0.0
extensions:
  - id: style-with-condition
    type: widget
    name: Style With Condition
    description: Style With Condition
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "style-with-condition",
  title: "style-with-condition.js",
  sourceCode: `// This example demonstrates how to apply conditional styling.
// The color is determined based on building height.

// Define a 3D Tiles layer
const sample3dTiles = {
  type: "simple", // Required
  data: {
    type: "3dtiles", // Data type
    url: "https://assets.cms.plateau.reearth.io/assets/4a/c9fb39-9c97-4da6-af8f-e08751a2f269/14100_yokohama-shi_city_2023_citygml_1_op_bldg_3dtiles_14103_nishi-ku_lod2_no_texture/tileset.json", // URL of the 3D Tiles
  },
  "3dtiles": {
    // Styling settings for the 3D Tiles
    color: {
      expression: {
        // Define conditions for coloring
        conditions: [
          ["\${_zmax} > 200", "color('#1d558d')"],
          ["\${_zmax} > 150", "color('#236ab1')"],
          ["\${_zmax} > 100", "color('#4e95dc')"],
          ["\${_zmax} > 50", "color('#95bfea')"],
          ["\${_zmax} > 0", "color('#edf4fc')"],
          ["true", "color('#0e2b47')"],

          // You can also use comparison operators, for example:
          // ["(\${_zmax} >= 50) && (\${feature['bldg:usage']} === '共同住宅')", "color('#923b2d')"]
        ],
      },
    },

    pbr: false, // Enable or disable Physically Based Rendering
    selectedFeatureColor: "red", // Color of selected features
  },
};

// Add the 3D Tiles layer to Re:Earth
// Documentation for Layers "add" method https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(sample3dTiles);

reearth.viewer.overrideProperty({
  // Enable Cesium World Terrain
  terrain: {
    enabled: true,
  },
  // Prevent buildings from floating above the terrain
  globe: {
    depthTestAgainstTerrain: true,
  },
});

// Move the camera to the specified position
// Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  {
    // Define the camera's target position
    heading: 0.10193671933979864,
    height: 563.1469223768704,
    lat: 35.44726736967154,
    lng: 139.62880155152584,
    pitch: -0.4516366842962034,
    roll: 0.0000432060048165539,
  },
  {
    // Define the duration of the camera movement (in seconds)
    duration: 2.0,
  }
);

// Set the timeline to a morning hour so that building colors are easy to see
// Documentation for Timeline "setTime" method https://visualizer.developer.reearth.io/plugin-api/timeline/#settime
reearth.timeline.setTime({
    start: new Date("2023-01-01T00:00:00Z"),
    stop: new Date("2023-01-01T10:00:00Z"),
    current: new Date("2023-01-01T02:00:00Z"),
  })
`
};

export const styleWithCondition: PluginType = {
  id: "style-with-condition",
  files: [yamlFile, widgetFile]
};
