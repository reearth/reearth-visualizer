import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-3dTiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-3dTiles-plugin
name: Add 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-3dTiles
    type: widget
    name: Add 3D Tiles
    description: Add 3D Tiles
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
  id: "layers-add-3dTiles",
  title: "layers-add-3dTiles.js",
  sourceCode: `will add script`
};

export const add3dTiles: PluginType = {
  id: "add-3dTiles",
  title: "Add 3D Tiles",
  files: [widgetFile, yamlFile]
};
