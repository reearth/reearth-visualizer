import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "playback-control-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: playback-control-plugin
name: Playback Control
version: 1.0.0
extensions:
  - id: playback-control
    type: widget
    name: Playback Control
    description: Playback Control
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "playback-control",
  title: "playback-control.js",
  sourceCode: `TBD
`
};

export const playbackControl: PluginType = {
  id: "playback-control",
  title: "Playback Control",
  files: [widgetFile, yamlFile]
};
