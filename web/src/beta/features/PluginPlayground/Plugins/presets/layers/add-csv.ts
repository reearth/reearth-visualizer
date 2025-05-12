import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-csv-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-csv-plugin
name: Add CSV
version: 1.0.0
extensions:
  - id: layers-add-csv
    type: widget
    name: Add CSV
    description: Add CSV
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-csv",
  title: "layers-add-csv.js",
  sourceCode: `// Example of adding a layer with CSV data
// This shows where the evacuation area in Setagaya-ku,Tokyo

// Define CSV data
const layerCsv = {
  type: "simple", // Required
  data: {
    type: "csv",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/csv/tokyoEvacuationPoint.csv", // URL of CSV
    csv: {
      // Define by column name
      lngColumn: "経度",
      latColumn: "緯度",
    },
  },
  // Activate Infobox
  infobox: {
    blocks: [
      {
        pluginId: "reearth",
        extensionId: "propertyInfoboxBetaBlock",
      },
    ],
  },
  // Settings for the feature style. This statement is required even if no style is set.
  marker: {
    style: "image",
    image:"https://reearth.github.io/visualizer-plugin-sample-data/public/image/evacuationIcon.svg",
    imageSize: 0.5,
    label: true,
    // Define the column name you want to display as label
    labelText: {
      expression: "\${施設名}", 
    },
    // Define label positon "left" | "right" | "top" | "bottom" | "lefttop" | "leftbottom" | "righttop" | "rightbottom";
    labelPosition: "top",
    labelTypography: {
      color: "#FFFFFF",
      fontSize: 15,
    },
  },
};

// Add the CSV layer from the URL to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerCsv);

reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 6.283185307179573,
    height: 2686.201362510873,
    lat: 35.606842852199016,
    lng: 139.65424753730483,
    pitch: -1.5621792552302458,
    roll: 0,
  }
);

// data: 東京都オープンデータカタログサイト 避難所・避難場所一覧データ（CC BY4.0） https://catalog.data.metro.tokyo.lg.jp/dataset/t000003d0000000093
`
};

export const addCsv: PluginType = {
  id: "add-csv",
  files: [yamlFile, widgetFile]
};
