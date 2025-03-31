import { FileType, PluginType } from "../../constants";

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
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background flex-column align-center p-16 rounded-sm gap-16">
      <label class="toggle">
        <input type="checkbox" id="toggleSwitch">
        <span class="slider"></span>
      </label>
      <div class="text-md" id="status">Terrain: OFF</div>
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
