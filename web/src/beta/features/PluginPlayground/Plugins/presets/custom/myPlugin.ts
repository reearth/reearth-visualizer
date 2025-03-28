import { FileType, PluginType } from "../../constants";

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
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background text-center p-16 rounded-sm">
    <p class="text-3xl font-bold">Hello World</p>
  </div>
\`); `
};

const demoInfoboxBlock1File: FileType = {
  id: "custom-my-plugin-demo-infobox-block-1",
  title: "demo-infobox-block-1.js",
  sourceCode: `reearth.ui.show(\`
    <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background text-center p-16 rounded-sm">
    <p class="text-3xl font-bold">Infobox Block 1</p>
  </div>
\`); `
};

const demoInfoboxBlock2File: FileType = {
  id: "custom-my-plugin-demo-infobox-block-2",
  title: "demo-infobox-block-2.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background text-center p-16 rounded-sm">
    <p class="text-3xl font-bold">Infobox Block 2</p>
  </div>
\`); `
};

const demoStoryBlockFile: FileType = {
  id: "custom-my-plugin-demo-story",
  title: "demo-story-block.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background text-center p-16 rounded-sm">
    <p class="text-3xl font-bold">Demo Story</p>
  </div>
\`); `
};

export const myPlugin: PluginType = {
  id: "my-plugin",
  files: [
    yamlFile,
    widgetFile,
    demoInfoboxBlock1File,
    demoInfoboxBlock2File,
    demoStoryBlockFile
  ]
};
