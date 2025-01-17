import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-czml-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-czml-plugin
name: Add CZML
version: 1.0.0
extensions:
  - id: layers-add-czml
    type: widget
    name: Add CZML
    description: Add CZML
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
  id: "layers-add-czml",
  title: "layers-add-czml.js",
  sourceCode: `
  // will create code
`
};

export const addCzml: PluginType = {
  id: "add-czml",
  title: "Add CZML",
  files: [widgetFile, yamlFile]
};
