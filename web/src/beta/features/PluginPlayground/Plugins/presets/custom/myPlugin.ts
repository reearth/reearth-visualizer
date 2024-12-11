import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "custom-my-plugin-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: my-plugin
name: My plugin
version: 1.0.0
extensions:
  - id: demo-widget
    type: widget
    name: Demo Widget
    description: Demo widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "custom-my-plugin-demo-widget",
  title: "demo-widget.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div id="wrapper">
    <h2 style="text-align: center;">Hello World</h2>
  </div>
\`); `
};

export const myPlugin: PluginType = {
  id: "my-plugin",
  title: "My Plugin",
  files: [widgetFile, yamlFile]
};
