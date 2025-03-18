import { FileType, PluginType } from "../../constants";

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
  <style>
    /* Generic styling system that provides consistent UI components and styling across all plugins */

    @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");

    /* Plugin-specific styling */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .header-menu {
      list-style: none;
      display: flex;
      gap: 15px;
    }
  </style>
  <div id="wrapper">
    <div class="header">
      <div class="header-logo">
        <p>Re:Earth</p>
      </div>
      <ul class="header-menu">
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
