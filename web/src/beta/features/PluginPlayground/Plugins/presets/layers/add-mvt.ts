import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-mvt-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-mvt-plugin
name: Add MVT
version: 1.0.0
extensions:
  - id: layers-add-mvt
    type: widget
    name: Add MVT
    description: Add MVT
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-mvt",
  title: "layers-add-mvt.js",
  sourceCode: `tbd
`
};

export const addMvt: PluginType = {
  id: "add-mvt",
  title: "Add MVT(Mapbox Vector Tile)",
  files: [widgetFile, yamlFile]
};
