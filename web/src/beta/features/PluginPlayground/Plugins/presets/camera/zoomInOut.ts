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

// Click the buttons to switch between different 3D Tiles color gradients

// Define the plug-in UI //
reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .zoomBtn {
      padding: 8px;
      border-radius: 4px;
      border: none;
      background: #ffffff;
      color: #000000;
      cursor: pointer;
      width: 100px;
      height: 40px;
      font-size: 24px 
    }
    .zoomBtn:active {
      background: #dcdcdc;
    }

  </style>
  <div id="wrapper">
    <h2>Zoom Level</h2>
    <div class="flex-center">
      <button class = "zoomBtn" id="zoomIn">+</button>
      <button class = "zoomBtn" id="zoomOut">−</button>
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

// Listen for messages from the UI and override the style for "zoomIn" or "zoomOut"
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "zoomIn") {
    reearth.camera.zoomIn(2, {
      duration: 0.5, 
      withoutAnimation: false, // Enable animation
    });   
  } else if (action === "zoomOut") {
    reearth.camera.zoomOut(2, {
      duration: 0.5, 
      withoutAnimation: false, // Enable animation
    });
  }
});`
};

export const zoomInOut: PluginType = {
  id: "zoom-in-out",
  title: "Zoom In / Out",
  files: [widgetFile, yamlFile]
};
