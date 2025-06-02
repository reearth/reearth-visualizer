import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-point-cloud-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-point-cloud-plugin
name: Add Point Cloud
version: 1.0.0
extensions:
  - id: layers-add-point-cloud
    type: widget
    name: Add Point Cloud
    description: Add Point Cloud
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-point-cloud",
  title: "layers-add-point-cloud.js",
  sourceCode: `// Example of adding point cloud data in the 3D Tiles format

// Define 3D Tiles
const pointcloud = {
  type: "simple", // Required
  data: {
    type: "3dtiles",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/3dtiles/nagasakiPointCloud/tileset.json", // URL of 3D Tiles
  },
  "3dtiles": {}, // If the point cloud data has original colors and you want to apply them, set the style here.
};

// Add the 3D Tiles layer from the URL to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(pointcloud);

// Move the camera to the position where point cloud data is displayed.
// Documentation on Camera "flyTo" event: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 0.8210147962450387,
    height: 570.5359613819405,
    lat: 32.745404272807654,
    lng: 129.85962591335263,
    pitch: -0.3665341132929105,
    roll: 6.283182270463368,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

// data:Nagasaki Prefectural(CCBY4.0) https://opennagasaki.nerc.or.jp`
};

export const addPointCloud: PluginType = {
  id: "add-point-cloud",
  files: [yamlFile, widgetFile]
};
