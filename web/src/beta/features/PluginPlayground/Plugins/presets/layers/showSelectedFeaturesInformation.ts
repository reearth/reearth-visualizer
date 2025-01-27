import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "layers-show-features-info-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: show-features-info-plugin
name: Show Selected Features Information
version: 1.0.0
extensions:
  - id: show-features-info
    type: widget
    name: Show Selected Features Information Widget
    description: Selected Feature Information Widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: center
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "show-features-info",
  title: "show-features-info.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
  </style>
    <div id="wrapper">
      <h3>Click to show Building ID</h3>
      <div class="coordinates">
        <p>Building ID: <span id="lat" class="coordinate-value">-</span></p>
      </div>
    </div>
  \`); `
};

export const showFeaturesInfo: PluginType = {
  id: "show-features-info",
  title: "Show Selected Features Information",
  files: [widgetFile, yamlFile]
};
