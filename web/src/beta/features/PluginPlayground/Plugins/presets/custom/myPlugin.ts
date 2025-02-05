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
    schema:
      groups:
      - id: default
        title: Data
        fields:
          - id: bgColor
            type: string
            title: Background Color
            name: Background Color
            ui: color
          - id: title 
            type: string
            title: Title
            name: Title
     
  - id: demo-infobox-block-1
    type: infoboxBlock
    name: Demo Infobox Block 1
  - id: demo-infobox-block-2
    type: infoboxBlock
    name: Demo Infobox Block 2
  - id: demo-story-block
    type: storyBlock
    name: Demo Story Block
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

const demoInfoboxBlock1File: FileType = {
  id: "custom-my-plugin-demo-infobox-block-1",
  title: "demo-infobox-block-1.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div id="wrapper">
    <h2 style="text-align: center;">Infobox Block 1</h2>
  </div>  
\`); `
};

const demoInfoboxBlock2File: FileType = {
  id: "custom-my-plugin-demo-infobox-block-2",
  title: "demo-infobox-block-2.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div id="wrapper">
    <h2 style="text-align: center;">Infobox Block 2</h2>
  </div>  
\`); `
};

const demoStoryFile: FileType = {
  id: "custom-my-plugin-demo-story",
  title: "demo-story-block.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div id="wrapper">
    <h2 style="text-align: center;">Demo Story</h2>
  </div>  
\`); `
};

export const myPlugin: PluginType = {
  id: "my-plugin",
  title: "My Plugin",
  files: [
    widgetFile,
    demoInfoboxBlock1File,
    demoInfoboxBlock2File,
    demoStoryFile,
    yamlFile
  ]
};
