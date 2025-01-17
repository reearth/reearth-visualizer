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
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-csv",
  title: "layers-add-csv.js",
  sourceCode: `// Example of adding a layer with CSV data

// Difine CSV data
const layerCsv = {
  type: "simple", // Required
  data: {
    type: "csv",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/csv/marker.csv", // URL of CSV
    csv: { // Difine by column number or column name
      idColumn: "id", 
      lngColumn: "longitude",
      latColumn: "latitude",
    },
  },
  marker: {},// Settings for the feature style. This statement is required even if no style is set.
};

// Add the CSV layer from the URL to Re:Earth
reearth.layers.add(layerCsv);
`
};

export const addCsv: PluginType = {
  id: "add-csv",
  title: "Add CSV",
  files: [widgetFile, yamlFile]
};
