import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "enable-shadow-style-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: enable-shadow-style-plugin
name: Enable Shadow Style
version: 1.0.0
extensions:
  - id: enable-shadow-style
    type: widget
    name: Enable Shadow Style
    description: Enable Shadow Style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "enable-shadow-style",
  title: "enable-shadow-style.js",
  sourceCode: `// This example shows how to activate the shadow style //

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
      <div class="status" id="status">Shadow: OFF</div>
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
                  status.textContent = 'Shadow: ON';
                  if (window.parent) {
                      window.parent.postMessage({ action: "activateShadow" }, "*");
                  }
              } else {
                  status.textContent = 'Shadow: OFF';
                  if (window.parent) {
                      window.parent.postMessage({ action: "deactivateShadow" }, "*");
                  }
              }
          });
      });
   </script>
\`);
  
// ================================
// Define Re:Earth(Web Assembly) side
// ================================

// Define 3D model data
const model3D = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [11.26530208523184,43.762801607369234],
      },
    },
  },
  model: {
    show: true,
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/gltf/car.gltf",
    minimumPixelSize: 100, // Sets the minimum visible size of the model
    maximumPixelSize: 1000, // Sets the maximum visible size of the model
    shadows: "enabled", // There are four options: "disabled", "enabled", "cast_only", "receive_only"
  },
};

// Add 3D models to the layer
// Documentation for Layers "add" method https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(model3D);
  
// Move the camera to a specified position
// Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  {
    // Defines the target camera position
    heading: 4.274949537980208,
    height: 97.5353033603559,
    lat: 43.76331789336607,
    lng: 11.267046519533347,
    pitch: -0.563719208566388,
    roll: 0.000002221797637425027,
  },
  {
    // Duration of the camera movement in seconds
    duration: 2.0,
  }
);

// In this example, the time width is set to set the time for the shadow to appear
// Set the time range on the timeline
// Documentation for Timeline "setTime" method https://visualizer.developer.reearth.io/plugin-api/timeline/#settime
reearth.timeline.setTime({
start: new Date("2023-12-01T09:00:00+01:00"),
stop: new Date("2023-12-01T10:00:00+01:00"),
current: new Date("2023-12-01T09:00:00+01:00"),
});
  
// Listen for messages from the UI to trigger shadow
// Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "activateShadow") {
    reearth.viewer.overrideProperty({
      scene: {
        shadow: {
          enabled: true,
        },
      },
    });
  } else if (action === "deactivateShadow") {
  //  Documentation for Viewer "overrideProperty" method https://visualizer.developer.reearth.io/plugin-api/viewer/#overrideproperty
    reearth.viewer.overrideProperty({
      scene: {
        shadow: {
          enabled: false,
        },
      },
    });
  }
});`
};

export const enableShadowStyle: PluginType = {
  id: "enable-shadow-style",
  files: [yamlFile, widgetFile]
};
