import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-googlePhotorealistic3dTiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-googlePhotorealistic3dTiles-plugin
name: Add Google Photorealistic 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-googlePhotorealistic3dTiles
    type: widget
    name: Add Google Photorealistic 3D Tiles
    description: Add Google Photorealistic 3D Tiles
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-googlePhotorealistic3dTiles",
  title: "layers-add-googlePhotorealistic3dTiles.js",
  sourceCode: `
`
};

export const addGooglePhotorealistic3dTiles: PluginType = {
  id: "add-googlePhotorealistic3dTiles",
  title: "Add Google Photorealistic 3D Tiles",
  files: [widgetFile, yamlFile]
};
