import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "timeDrivenFeatures-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: timeDrivenFeatures-plugin
name: Time Driven Features
version: 1.0.0
extensions:
  - id: timeDrivenFeatures
    type: widget
    name: Time Driven Features
    description: Time Driven Features
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "timeDrivenFeatures",
  title: "timeDrivenFeatures.js",
  sourceCode: `TBD
`
};

export const timeDrivenFeatures: PluginType = {
  id: "timeDrivenFeatures",
  title: "Time Driven Features",
  files: [widgetFile, yamlFile]
};
