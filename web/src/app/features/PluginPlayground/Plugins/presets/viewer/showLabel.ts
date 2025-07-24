import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "show-label-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: show-label-plugin
name: Show Label
version: 1.0.0
extensions:
  - id: show-label
    type: widget
    name: Show Label
    description: Show Label
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "show-label",
  title: "show-label.js",
  sourceCode: `// This example shows how to show label //
// Re:Earth currently supports labels only in Japan //

// Enable label display
reearth.viewer.overrideProperty({
  tileLabels: [
    {
      labelType: "japan_gsi_optimal_bvmap",
    },
  ],
});

// Define the camera position to be moved to
// Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 0.023912810765794212,
    height: 86462.83801302341,
    lat: 34.29235030757275,
    lng: 138.88051742499604,
    pitch: -0.6411851780116606,
    roll: 6.283038605616017,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

// Data Attribution: 国土地理院最適化ベクトルタイル //`
};

export const showLabel: PluginType = {
  id: "show-label",
  files: [yamlFile, widgetFile]
};
