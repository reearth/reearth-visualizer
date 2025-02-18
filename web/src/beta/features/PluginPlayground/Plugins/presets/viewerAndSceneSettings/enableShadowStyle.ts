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
    <button id="btn">Shadow ON</button>
  </div>
  
  <script>
  let shadow = false;
  const shadowBtn = document.getElementById("btn");
  
  // Set up an event listener
  shadowBtn.addEventListener("click", () => {
    // Toggle the shadow state
    shadow = !shadow;
    if (shadow) {
      shadowBtn.textContent = "Shadow OFF";
        parent.postMessage({ action: "activateShadow" }, "*");
    } else {
      shadowBtn.textContent = "Shadow ON";
      parent.postMessage({ action: "deactivateShadow" }, "*");
    }
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
        coordinates: [-85.38657958835984, 33.696966258616634],
      },
    },
  },
  model: {
    show: true,
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/gltf/car.gltf",
    heightReference: "clamp",
    minimumPixelSize: 100, // Sets the minimum visible size of the model
    maximumPixelSize: 1000, // Sets the maximum visible size of the model
    shadows: "enabled", // There are four options: "disabled", "enabled", "cast_only", "receive_only"
  },
};

// Add 3D models to the layer
reearth.layers.add(model3D);
  
// Move the camera to a specified position
reearth.camera.flyTo(
  {
    // Defines the target camera position
    heading: 5.358457498291187,
    height: 274.0013699012735,
    lat: 33.69505063085045,
    lng: -85.38408270921741,
    pitch: -0.7236883292676297,
    roll: 0.00000479625186056154,
  },
  {
    // Duration of the camera movement in seconds
    duration: 2.0,
  }
);

// In this example, the time width is set to set the time for the shadow to appear
// Set the time range on the timeline
reearth.timeline.setTime({
  // Start time
  start: new Date("2023-12-01T09:00:00-06:00"),
  // End time
  stop: new Date("2023-12-01T15:00:00-06:00"),
  // Time to be set as the current timeline position
  current: new Date("2023-12-01T10:00:00-06:00"),
});
  
// Listen for messages from the UI to trigger shadow
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
  title: "Enable Shadow Style",
  files: [widgetFile, yamlFile]
};
