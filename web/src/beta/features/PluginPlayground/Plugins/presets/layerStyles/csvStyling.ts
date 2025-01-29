import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "csv-styling-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: csv-styling-plugin
name: CSV Styling Examples
version: 1.0.0
extensions:
  - id: csv-styling
    type: widget
    name: CSV Styling
    description: Examples of CSV features with different styling options
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "csv-styling",
  title: "csv-styling.js",
  sourceCode: `
  // Define CSV layer
    const csvLayer = {
    type: "simple",
    title: "CSV Styling Example",
    data: {
      type: "csv",
      url: "https://reearth.github.io/visualizer-plugin-sample-data/public/csv/marker.csv",
      csv: {
        latColumn: "latitude",
        lngColumn: "longitude",
        heightColumn: "height"
      }
    },
  // Marker styling
    marker: {
      style: "point",
      pointColor: "red",
      pointSize: 12,
      pointOutlineColor: "white",
      pointOutlineWidth: 1,
      height: 100,
      heightReference: "relative"
    },
  };

  // Add layer
  const layerId = reearth.layers.add(csvLayer);
`
};

export const csvStyling: PluginType = {
  id: "csv-styling",
  title: "CSV Styling",
  files: [widgetFile, yamlFile]
};
