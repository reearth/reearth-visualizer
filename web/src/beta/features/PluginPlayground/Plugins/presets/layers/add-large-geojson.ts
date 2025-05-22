import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-large-geojson-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-large-geojson-plugin
name: Add Large GeoJSON
version: 1.0.0
extensions:
  - id: layers-add-large-geojson
    type: widget
    name: Add Large Geojson
    description: Add Large Geojson
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-large-geojson",
  title: "layers-add-large-geojson.js",
  sourceCode: `// For GeoJSON files with more than 6,000 coordinates, enable the "Prioritize Performance" feature.
// This improves rendering performance and enables smoother visualization of large datasets.

// Note: When this feature is enabled, you cannot apply styles from the Visualizer side.
// To apply custom styles, define them directly in the GeoJSON file.


// Define the GeoJSON
// Default color is yellow
const tokyoBoundary = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/tokyo-boundary.geojson",
    // Activate Prioritize Performance
    geojson: {
      useAsResource: true,
    },
  },
  polygon: {}
};

// Define a styled GeoJSON layer
// Line color is red (defined in the GeoJSON properties field)

// Example:
// "properties": {
//   "stroke": "#fb0404",
//   "stroke-width": 2,
//   "stroke-opacity": 1
// }
const kanagawaStyledGeoJson = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/kanagawa_boundary_styled.geojson",
    // Activate Prioritize Performance
    geojson: {
      useAsResource: true,
    },
  },
  polygon: {}
};

// Add the GeoJSON layer from the URL to Visualizer
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(tokyoBoundary);
reearth.layers.add(kanagawaStyledGeoJson);

// Move camera position
reearth.camera.flyTo(
  {
    heading: 0.07455195177368523,
    height: 176116.1557102376,
    lat: 35.508861417865475,
    lng: 139.39856564697655,
    pitch: -1.5612255074440147,
    roll: 0,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

//data: 国土交通省国土数値情報ダウンロードサイト https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v2_3.html 
`
};

export const addLargeGeojson: PluginType = {
  id: "add-large-geojson",
  files: [yamlFile, widgetFile]
};
