import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layer-style-3d-tiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layer-style-3d-tiles-plugin
name: Change 3D Tiles Style
version: 1.0.0
extensions:
  - id: layer-style-3d-tiles
    type: widget
    name: Change 3D Tiles Style
    description: Change 3D Tiles Style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layer-style-3d-tiles",
  title: "layer-style-3d-tiles.js",
  sourceCode: `
`
};

export const layerStyle3dTiles: PluginType = {
  id: "layer-style-3d-tiles",
  title: "Change 3D Tiles Style",
  files: [widgetFile, yamlFile]
};
