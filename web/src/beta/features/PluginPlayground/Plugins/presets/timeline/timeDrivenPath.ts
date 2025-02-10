import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "timeDrivenPath-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: timeDrivenPath-plugin
name: Time Driven Path
version: 1.0.0
extensions:
  - id: timeDrivenPath
    type: widget
    name: Time Driven Path
    description: Time Driven Path
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "timeDrivenPath",
  title: "timeDrivenPath.js",
  sourceCode: `TBD
`
};

export const timeDrivenPath: PluginType = {
  id: "timeDrivenPath",
  title: "Time Driven Path",
  files: [widgetFile, yamlFile]
};
