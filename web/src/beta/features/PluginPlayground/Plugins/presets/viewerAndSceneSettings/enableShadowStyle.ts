import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "enable-shadow-style-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: enable-shadow-style-plugin
name: Enable Shadow Style
version: 1.0.0
extensions:
  - id: enable-shadow-style
    type: widget
    name: Enable Shadow Style
    description: Enable Shadow Style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "enable-shadow-style",
  title: "enable-shadow-style.js",
  sourceCode: `TBD
`
};

export const enableShadowStyle: PluginType = {
  id: "enable-shadow-style",
  title: "Enable Shadow Style",
  files: [widgetFile, yamlFile]
};
