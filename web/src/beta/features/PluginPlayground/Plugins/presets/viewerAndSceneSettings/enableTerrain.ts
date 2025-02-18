import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "enable-terrain-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: enable-terrain-plugin
name: Enable Terrain
version: 1.0.0
extensions:
  - id: enable-terrain
    type: widget
    name: Enable Terrain
    description: Enable Terrain
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "enable-terrain",
  title: "enable-terrain.js",
  sourceCode: `TBD
`
};

export const enableTerrain: PluginType = {
  id: "enable-terrain",
  title: "Enable Terrain",
  files: [widgetFile, yamlFile]
};
