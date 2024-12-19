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
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "ui-header-widget",
  title: "header.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
    <style>
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        position: sticky;
        top: 0;
      }

      .header-logo img {
        height: 40px;
        cursor: pointer;
      }

      .header-menu {
        list-style: none;
        display: flex;
        gap: 15px;
        margin: 0;
        padding: 0;
      }

      .header-menu li {
        font-size: 14px;
        color: #555;
        cursor: pointer;
        transition: color 0.3s ease;
      }

      .header-menu li:active {
        color: #000;
      }
    </style>

    <div id="wrapper">
      <div class="header">
        <div class="header-logo">
          <img src="https://ml.globenewswire.com/Resource/Download/65935bec-afe1-4bf6-84d6-1a7e9d4ae611?size=2" alt="Re:Earth Logo">
        </div>
        <ul class="header-menu">
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
        </ul>
      </div>
    </div>
  \`); `
};

export const header: PluginType = {
  id: "header",
  title: "Header",
  files: [widgetFile, yamlFile]
};
