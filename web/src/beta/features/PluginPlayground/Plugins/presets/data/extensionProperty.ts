import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "extension-property-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: extension-property-plugin
name: Extension Property
version: 1.0.0
extensions:
  - id: extension-property-widget
    type: widget
    name: Extension Property Widget
    description: Extension Property Widget
    schema:
      groups:
      - id: default
        title: Default
        fields:
          - id: text
            type: string
            title: Text
          - id: color
            type: string
            title: Color
            ui: color
  - id: infobox-block
    type: infoboxBlock
    name: Infobox Block
    schema:
      groups:
      - id: default
        title: Default
        fields:
          - id: text
            type: string
            title: Text
          - id: color
            type: string
            title: Color
            ui: color
  - id: story-block
    type: storyBlock
    name: Story Block
    schema:
      groups:
      - id: default
        title: Default
        fields:
          - id: text
            type: string
            title: Text
          - id: color
            type: string
            title: Color
            ui: color
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "extension-property-widget",
  title: "extension-property-widget.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background p-16 rounded-sm flex-column gap-8">
    <p class="text-3xl font-bold text-center">Extension Property</p>
    <p class="text-md text-secondary text-center">Input on Extension Settings and execute code again.</p>
    <p class="text-md text-center" id="text"></p>
  </div>

  <script>
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "getWidgetProperty") {
        document.getElementById("text").textContent = msg.property?.default?.text ?? "";
        document.getElementById("text").style.color = msg.property?.default?.color ?? "";
      }
    });
  </script>
\`);

// Get widget property values and send to UI.
// Property schema is defined in reearth.yml.
reearth.ui.postMessage({
  type: "getWidgetProperty",
  property: reearth.extension.widget?.property
});`
};

const infoboxBlockFile: FileType = {
  id: "infobox-block",
  title: "infobox-block.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div id="wrapper">
    <h2 id="text" style="text-align: center;"></h2>
  </div>

  <script>
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "getBlockProperty") {
        document.getElementById("text").textContent = msg.property?.default?.text ?? "";
        document.getElementById("text").style.color = msg.property?.default?.color ?? "";
      }
    });
  </script>
\`);

// Get block property values and send to UI.
// Property schema is defined in reearth.yml.
reearth.ui.postMessage({
  type: "getBlockProperty",
  property: reearth.extension.block?.property
});`
};

const storyBlockFile: FileType = {
  id: "story-block",
  title: "story-block.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div id="wrapper">
    <h2 id="text" style="text-align: center;"></h2>
  </div>

  <script>
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "getBlockProperty") {
        document.getElementById("text").textContent = msg.property?.default?.text ?? "";
        document.getElementById("text").style.color = msg.property?.default?.color ?? "";
      }
    });
  </script>
\`);

// Get block property values and send to UI.
// Property schema is defined in reearth.yml.
// Documentation on UI "postMessage" method: https://visualizer.developer.reearth.io/plugin-api/ui/#postmessage
reearth.ui.postMessage({
  type: "getBlockProperty",
  // Documentation on Extension Block https://visualizer.developer.reearth.io/plugin-api/extension/#block
  property: reearth.extension.block?.property
});`
};

export const extensionProperty: PluginType = {
  id: "extension-property",
  files: [yamlFile, widgetFile, infoboxBlockFile, storyBlockFile]
};
