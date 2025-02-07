import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "camera-rotation-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: camera-rotation-plugin
name: Camera Rotation
version: 1.0.0
extensions:
  - id: camera-rotation
    type: widget
    name: Camera Rotation
    description: Camera Rotation
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "camera-rotation",
  title: "camera-rotation.js",
  sourceCode: `// ================================
// Define Plug-in UI side (iframe)
// ================================

reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
<style>
#rotateBtn {
  border: 1.5px solid #dcdcdc;
  padding: 0;           
  border-radius: 5px;
  background: #ffffff;
  color: #000000;
  cursor: pointer;
  width: 200px;
  height: 40px;           
  font-size: 16px;      
}
#rotateBtn:active {
  background: #dcdcdc;
}
#button-container {
  display: flex;  
  justify-content: center;                
}
</style>

<div id="wrapper">
  <h3>Rotate Camera Angle</h3>
    <div id= "button-container">
      <button id="rotateBtn">Click here</button>
    </div>
</div>

<script>
let rotating = false;
let intervalId;
const rotateBtn = document.getElementById("rotateBtn");

// Set up an event listener
rotateBtn.addEventListener("click", () => {
  // Toggle the rotation state
  rotating = !rotating;
  if (rotating) {
    rotateBtn.textContent = "Stop Rotation";
    // Send 60 postMessages per second (60fps)
    intervalId = setInterval(() => {
      parent.postMessage({ action: "rotateCamera" }, "*");
    }, 1000 / 60);
  } else {
    // Stop sending messages
    rotateBtn.textContent = "Start Rotation";
    clearInterval(intervalId);
  }
});

// To prevent memory leaks, stop "setInterval" when the page is closed or navigated away from
window.addEventListener("unload", () => {
  if (intervalId) {
    clearInterval(intervalId); 
  }
});
</script>
\`);

// ================================
// Define Re:Earth(Web Assembly) side
// ================================

// Define a 3D Tiles layer
const sample3dTiles = {
  type: "simple", // Required
  data: {
    type: "3dtiles", // Data type
    url: "https://assets.cms.plateau.reearth.io/assets/4a/c9fb39-9c97-4da6-af8f-e08751a2f269/14100_yokohama-shi_city_2023_citygml_1_op_bldg_3dtiles_14103_nishi-ku_lod2_no_texture/tileset.json", // URL of the 3D Tiles
  },
  "3dtiles": {
    // Styling settings for the 3D Tiles
    color:"#fffafa",
    pbr: false, // Enable or disable Physically Based Rendering
  },
};

// Add the 3D Tiles layer to Re:Earth
reearth.layers.add(sample3dTiles);

reearth.viewer.overrideProperty({
  // Enable Cesium World Terrain
  terrain: {
    enabled: true,
  },
  // Prevent buildings from floating above the terrain
  globe: {
    depthTestAgainstTerrain: true,
  },
});

// Move the camera to the specified position
reearth.camera.flyTo(
  {
    // Define the camera's target position
    heading: 0.10193671933979864,
    height: 563.1469223768704,
    lat: 35.44726736967154,
    lng: 139.62880155152584,
    pitch: -0.4516366842962034,
    roll: 0.0000432060048165539,
  },
  {
    // Define the duration of the camera movement (in seconds)
    duration: 2.0,
  }
);

// Listen for messages from the UI to trigger camera rotation
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "rotateCamera"){
    // Rotate the camera by a specified angle in radians
    reearth.camera.rotateAround(0.001);
  }
})`
};

export const cameraRotation: PluginType = {
  id: "camera-rotation",
  title: "Camera Rotation",
  files: [widgetFile, yamlFile]
};
