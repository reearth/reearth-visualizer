import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "enable-terrain-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: enable-terrain-plugin
name: Enable Terrain
version: 1.0.0
extensions:
  - id: enable-terrain
    type: widget
    name: Enable Terrain
    description: Enable Terrain
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "enable-terrain",
  title: "enable-terrain.js",
  sourceCode: `
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 0.9658416610554319,
    height: 5632.307221882181,
    lat: 35.30495385208046,
    lng: 138.62843439939437,
    pitch: -0.3232851887743784,
    roll: 6.283155211555897,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

reearth.viewer.overrideProperty({
  // Enable Cesium World Terrain
  terrain: {
    enabled: true,
  },
  // Enable the function for buildings not to lift off the ground
  globe: {
    depthTestAgainstTerrain: true,
  },
  // Enable shadows
  scene: {
    shadow: {
      enabled: true,
    },
  },
});`
};

export const enableTerrain: PluginType = {
  id: "enable-terrain",
  title: "Enable Terrain",
  files: [widgetFile, yamlFile]
};
