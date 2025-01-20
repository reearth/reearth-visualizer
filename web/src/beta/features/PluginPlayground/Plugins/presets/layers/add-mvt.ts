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
  sourceCode: `// Define the MVT(Mapbox Vector Tile) as a normal string
const layerMvtUrl = {
  type: "simple",
  data: {
    type: "mvt",
    // URL of MVT
    url: "https://assets.cms.plateau.reearth.io/assets/e9/2c8fcc-1226-4d52-8c0b-251aeac3d380/13113_shibuya-ku_pref_2023_citygml_1_op_tran_mvt_lod2/{z}/{x}/{y}.mvt",
    layers: ["TrafficArea", "AuxiliaryTrafficArea"],
  },
  polyline:{}
};

reearth.layers.add(layerMvtUrl);
`
};

export const addMvt: PluginType = {
  id: "add-mvt",
  title: "Add MVT(Mapbox Vector Tile)",
  files: [widgetFile, yamlFile]
};
