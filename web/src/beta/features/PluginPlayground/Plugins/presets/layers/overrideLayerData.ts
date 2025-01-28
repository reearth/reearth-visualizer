import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "override-layer-data-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: override-layer-data-plugin
name: Override Layer Data
version: 1.0.0
extensions:
  - id: override-layer-data
    type: widget
    name: Override Layer Data
    description: Override Layer Data
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "override-layer-data",
  title: "override-layer-data.js",
  sourceCode: `TBD`
};

export const overrideLayerData: PluginType = {
  id: "Override Layer Data",
  title: "Override Layer Data",
  files: [widgetFile, yamlFile]
};
