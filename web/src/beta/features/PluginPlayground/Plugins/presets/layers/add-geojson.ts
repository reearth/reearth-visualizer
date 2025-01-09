import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-geojson-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: add-geojson-plugin
name: Add GeoJSON
version: 1.0.0
extensions:
  - id: add geojson
    type: widget
    name: Add Geojson
    description: Add Geojson
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
  id: "layers-add-geojson",
  title: "layers-add-geojson.js",
  sourceCode: `
  <script>
  </script> 
  `
};

export const responsivePanel: PluginType = {
  id: "add-geojson",
  title: "Add GeoJSON",
  files: [widgetFile, yamlFile]
};
