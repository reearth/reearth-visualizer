import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-osm3dTiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-osm3dTiles-plugin
name: Add OSM 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-osm3dTiles
    type: widget
    name: Add OSM 3D Tiles
    description: Add OSM 3D Tiles
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-osm3dTiles",
  title: "layers-add-osm3dTiles.js",
  sourceCode: `tbd...`
};

export const addOsm3dTiles: PluginType = {
  id: "add-osm3dTiles",
  title: "Add OSM 3D Tiles",
  files: [widgetFile, yamlFile]
};
