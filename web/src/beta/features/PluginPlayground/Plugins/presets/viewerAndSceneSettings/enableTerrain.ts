import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "enable-terrain-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: enable-terrain-plugin
name: Enable Terrain
version: 1.0.0
extensions:
  - id: enable-terrain
    type: widget
    name: Enable Terrain
    description: Enable Terrain
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "enable-terrain",
  title: "enable-terrain.js",
  sourceCode: `// ================================
// Define Plug-in UI side (iframe)
// ================================

reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
<style>
  #btn {
    padding: 8px;
    border-radius: 4px;
    bborder: 1px solid #808080;
    background: #ffffff;
    color: #000000;
    cursor: pointer;
    width: 180px;
    height: 70px;
    font-size: 18px 
  }
  #btn:active {
    background: #dcdcdc;
  }

  #button-container {
  display: flex;
  gap: 8px;           
  }
</style>

<div id= "button-container">
  <button id="btn">Terrain ON</button>
</div>

<script>
let terrain = false;
const terrainBtn = document.getElementById("btn");

// Set up an event listener
terrainBtn.addEventListener("click", () => {
  // Toggle the terrain state
  terrain = !terrain;
  if (terrain) {
    terrainBtn.textContent = "Terrain OFF";
      parent.postMessage({ action: "activateTerrain" }, "*");
  } else {
    terrainBtn.textContent = "Terrain ON";
    parent.postMessage({ action: "deactivateTerrain" }, "*");
  }
});
</script>
    \`);

// ================================
// Define Re:Earth(Web Assembly) side
// ================================

reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 0.9658416610554319,
    height: 5632.307221882181,
    lat: 35.30495385208046,
    lng: 138.62843439939437,
    pitch: -0.3232851887743784,
    roll: 6.283155211555897,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

// Listen for messages from the UI to trigger terrain
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "activateTerrain") {
    reearth.viewer.overrideProperty({
      // Enable Cesium World Terrain
      terrain: {
        enabled: true,
      },
      // Enable the function for buildings not to lift off the ground
      globe: {
        depthTestAgainstTerrain: true,
      },
      // Enable shadows
    });
  } else if (action === "deactivateTerrain") {
    reearth.viewer.overrideProperty({
      // Disable Cesium World Terrain
      terrain: {
        enabled: false,
      },
      // Disable the function for buildings not to lift off the ground
      globe: {
        depthTestAgainstTerrain: false,
      },
    });
  }
});`
};

export const enableTerrain: PluginType = {
  id: "enable-terrain",
  title: "Enable Terrain",
  files: [widgetFile, yamlFile]
};
