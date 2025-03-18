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
  sourceCode: `// This example shows how to activate the terrain //

// ================================
// Define Plug-in UI side (iframe)
// ================================

reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
<style>
   body {
   display: flex;
   justify-content: center;
   align-items: center;
   height: 100vh;
   margin: 0;
   background-color: #f5f5f5;
   font-family: Arial, sans-serif;
   }
   .toggle-container {
   display: flex;
   flex-direction: column;
   align-items: center;
   }
   .toggle {
   position: relative;
   display: inline-block;
   width: 60px;
   height: 34px;
   }
   .toggle input {
   opacity: 0;
   width: 0;
   height: 0;
   }
   .slider {
   position: absolute;
   cursor: pointer;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: #ccc;
   transition: .4s;
   border-radius: 34px;
   }
   .slider:before {
   position: absolute;
   content: "";
   height: 26px;
   width: 26px;
   left: 4px;
   bottom: 4px;
   background-color: white;
   transition: .4s;
   border-radius: 50%;
   }
   input:checked + .slider {
   background-color: #2196F3;
   }
   input:focus + .slider {
   box-shadow: 0 0 1px #2196F3;
   }
   input:checked + .slider:before {
   transform: translateX(26px);
   }
   .status {
   margin-top: 20px;
   font-size: 18px;
   }
</style>
   <div class="toggle-container">
      <label class="toggle">
      <input type="checkbox" id="toggleSwitch">
      <span class="slider"></span>
      </label>
      <div class="status" id="status">Terrain: OFF</div>
   </div>
   <script>
      document.addEventListener('DOMContentLoaded', function() {
          const toggleSwitch = document.getElementById('toggleSwitch');
          const status = document.getElementById('status');
      
          if (!toggleSwitch || !status) {
              console.error('Required elements not found');
              return;
          }
      
          toggleSwitch.addEventListener('change', function() {
              if (this.checked) {
                  status.textContent = 'Terrain: ON';
                  if (window.parent) {
                      window.parent.postMessage({ action: "activateTerrain" }, "*");
                  }
              } else {
                  status.textContent = 'Terrain: OFF';
                  if (window.parent) {
                      window.parent.postMessage({ action: "deactivateTerrain" }, "*");
                  }
              }
          });
      });
   </script>
\`);

// ================================
// Define Re:Earth(Web Assembly) side
// ================================

// Move the camera to a specified position
// Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
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
// Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "activateTerrain") {
  // Documentation for Viewer "overrideProperty" method https://visualizer.developer.reearth.io/plugin-api/viewer/#overrideproperty
    reearth.viewer.overrideProperty({
      // Enable Cesium World Terrain
      terrain: {
        enabled: true,
      },
      // Enable the function for features not to lift off the ground
      globe: {
        depthTestAgainstTerrain: true,
      },
    });
  } else if (action === "deactivateTerrain") {
    reearth.viewer.overrideProperty({
      // Disable Cesium World Terrain
      terrain: {
        enabled: false,
      },
      // Disable the function for features not to lift off the ground
      globe: {
        depthTestAgainstTerrain: false,
      },
    });
  }
});`
};

export const enableTerrain: PluginType = {
  id: "enable-terrain",
  files: [yamlFile, widgetFile]
};
