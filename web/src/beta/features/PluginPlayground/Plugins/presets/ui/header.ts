import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "ui-header-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: header-plugin
name: Header
version: 1.0.0
extensions:
  - id: header
    type: widget
    name: Header Widget
    description: Header Widget
    widgetLayout:
      extended: true
      defaultLocation:
        zone: outer
        section: center
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "ui-header-widget",
  title: "header.js",
  sourceCode: `// A header navigation bar with logo and menu items

  reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div class="primary-background p-16 primary-shadow rounded-sm">
    <div class="flex-between">
      <div>
        <p>Re:Earth</p>
      </div>
      <ul class="display-flex gap-16">
        <li>Home</li>
        <li>About</li>
        <li>Services</li>
        <li>Contact</li>
        <li>FAQ</li>
      </ul>
    </div>
  </div>
  \`); `
};

export const header: PluginType = {
  id: "header",
  files: [yamlFile, widgetFile]
};
