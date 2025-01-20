import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-wms-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-wms-plugin
name: Add wms
version: 1.0.0
extensions:
  - id: layers-add-wms
    type: widget
    name: Add wms
    description: Add wms
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-wms",
  title: "layers-add-wms.js",
  sourceCode: `tbd
`
};

export const addWms: PluginType = {
  id: "add-wms",
  title: "Add WMS (Web Map Service)",
  files: [widgetFile, yamlFile]
};
