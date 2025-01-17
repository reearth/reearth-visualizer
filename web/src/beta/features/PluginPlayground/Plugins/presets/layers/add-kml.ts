import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-kml-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-kml-plugin
name: Add CZML
version: 1.0.0
extensions:
  - id: layers-add-kml
    type: widget
    name: Add KML
    description: Add KML
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
  id: "layers-add-kml",
  title: "layers-add-kml.js",
  sourceCode: `will create script
`
};

export const addKml: PluginType = {
  id: "add-kml",
  title: "Add KML",
  files: [widgetFile, yamlFile]
};