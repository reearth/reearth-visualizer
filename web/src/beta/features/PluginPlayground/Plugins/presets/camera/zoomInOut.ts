import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "zoom-in-out-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: zoom-in-out-plugin
name: Zoom In / Out
version: 1.0.0
extensions:
  - id: zoom-in-out
    type: widget
    name: Zoom In / Out
    description: Zoom In / Out
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "zoom-in-out",
  title: "zoom-in-out.js",
  sourceCode: `// This example demonstrates how to Zoom In / Out
// Click the buttons to change zoom level

// ================================
// Define Plug-in UI side (iframe)
// ================================
reearth.ui.show(\`
<style>
/* Generic styling system that provides consistent UI components and styling across all plugins */

@import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
</style>
  <div class="primary-background flex-column gap-8 text-center justify-center p-16 rounded-sm">
    <p class="text-3xl font-bold">Zoom Level</p>
    <p class="text-md text-secondary text-center">Click the buttons to change zoom level</p>
    <div class="flex-center gap-8">
      <button class="display-flex align-center justify-center btn btn-neutral w-10 h-5" id="zoomIn">
        <img src="https://reearth.github.io/visualizer-plugin-sample-data/public/image/plus.svg" alt="Zoom In" />
      </button>
      <button class="display-flex align-center justify-center btn btn-neutral w-10 h-5" id="zoomOut">
        <img src="https://reearth.github.io/visualizer-plugin-sample-data/public/image/minus.svg" alt="Zoom Out" />
      </button>
    </div>
  </div>

  <script>
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut  = document.getElementById("zoomOut");

  // Click a button to send a postMessage to Re:Earth(Web Assembly) side.
  zoomIn.addEventListener("click",() =>{
    parent.postMessage({
      action: "zoomIn",
    }, "*");
    })

  zoomOut.addEventListener("click",() =>{
    parent.postMessage({
      action: "zoomOut",
    }, "*");
    })
  </script>
  \`);

// ================================
// Define Re:Earth(Web Assembly) side
// ================================

// Listen for messages from the UI and update zoom level
// Documentation on Extension "on" event: https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "zoomIn") {
    // Increasing the value increases the change to zoom
    // Documentation on Camera "zoomIn" method: https://visualizer.developer.reearth.io/plugin-api/camera/#zoomin
    reearth.camera.zoomIn(2);
  } else if (action === "zoomOut") {
  // Documentation on Camera "zoomOut" method: https://visualizer.developer.reearth.io/plugin-api/camera/#zoomout
    reearth.camera.zoomOut(2);
  }
});`
};

export const zoomInOut: PluginType = {
  id: "zoom-in-out",
  files: [yamlFile, widgetFile]
};
