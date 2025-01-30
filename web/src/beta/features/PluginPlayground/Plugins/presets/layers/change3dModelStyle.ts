import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layer-style-3d-model-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layer-style-3d-model-plugin
name: Change 3D Model Style
version: 1.0.0
extensions:
  - id: layer-style-3d-model
    type: widget
    name: Change 3D Model Style
    description: Change 3D Model Style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layer-style-3d-model",
  title: "layer-style-3d-model.js",
  sourceCode: `
`
};

export const layerStyle3dModel: PluginType = {
  id: "layer-style-3d-model",
  title: "Change 3D Model Style",
  files: [widgetFile, yamlFile]
};
