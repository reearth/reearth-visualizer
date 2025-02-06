import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

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
${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .zoomBtn {
      display: flex;  
      align-items: center;    
      justify-content: center;
      padding: 8px;
      border-radius: 4px;
      border: none;
      background: #ffffff;
      color: #000000;
      cursor: pointer;
      width: 100px;
      height: 40px;
      font-size: 29px 
    }
    .zoomBtn:active {
      background: #dcdcdc;
    }
    .zoomBtn img {
    display: block;
    width: 20px;
    height: 20px;
    }

  </style>
  <div id="wrapper">
    <h2>Zoom Level</h2>
    <div class="flex-center">
      <button class="zoomBtn" id="zoomIn">
        <img src="https://reearth.github.io/visualizer-plugin-sample-data/public/image/plus.svg" alt="Zoom In" />
      </button>
      <button class="zoomBtn" id="zoomOut">
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
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "zoomIn") {
    // Increasing the value increases the change to zoom
    reearth.camera.zoomIn(2);   
  } else if (action === "zoomOut") {
    reearth.camera.zoomOut(2);
  }
});`
};

export const zoomInOut: PluginType = {
  id: "zoom-in-out",
  title: "Zoom In / Out",
  files: [widgetFile, yamlFile]
};
