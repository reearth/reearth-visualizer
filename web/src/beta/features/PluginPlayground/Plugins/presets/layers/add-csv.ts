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

// Define CSV data
const layerCsv = {
  type: "simple", // Required
  data: {
    type: "csv",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/csv/marker.csv", // URL of CSV
    csv: { // Define by column name
      lngColumn: "longitude",
      latColumn: "latitude",
    },
  },
  marker: {},// Settings for the feature style. This statement is required even if no style is set.
};

// Add the CSV layer from the URL to Re:Earth
// NOTE: Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerCsv);
`
};

export const addCsv: PluginType = {
  id: "add-csv",
  files: [yamlFile, widgetFile]
};
