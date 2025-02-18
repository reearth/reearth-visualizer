import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

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
            name: Text
          - id: color
            type: string
            name: Color
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
            name: Text
          - id: color
            type: string
            name: Color
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
            name: Text
          - id: color
            type: string
            name: Color
            ui: color
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "extension-property-widget",
  title: "extension-property-widget.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div id="wrapper">
    <h2>Extension Property</h2>
    <h3 style="text-align:center">Input on Extension Settings and execute code again.</h3>
    <h3 style="text-align:center" id="text"></h3>
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
  ${PRESET_PLUGIN_COMMON_STYLE}
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
  ${PRESET_PLUGIN_COMMON_STYLE}
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

export const extensionProperty: PluginType = {
  id: "extension-property",
  title: "Extension Property",
  files: [infoboxBlockFile, storyBlockFile, widgetFile, yamlFile]
};
