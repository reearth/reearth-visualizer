import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "mouse-events-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: mouse-events-plugin
name: Mouse Events
version: 1.0.0
extensions:
  - id: mouse-events
    type: widget
    name: Mouse Events
    description: Mouse Events
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "mouse-events",
  title: "mouse-events.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .coord-container {
      background: #fff;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }

    .coordinates {
      font-family: monospace;
      margin: 5px 0;
      line-height: 1.6;
    }

    .coords-title {
      color: #555;
      font-size: 14px;
      margin-bottom: 10px;
      text-align: left;
    }

    .coordinate-value {
      font-weight: bold;
      color: #333;
    }
  </style>

  <div id="wrapper">
    <h2>Click Coordinates</h2>
    <div class="coord-container">
      <div class="coords-title">Click anywhere to see coordinates:</div>
      <div class="coordinates">
        <div>Latitude: <span id="lat" class="coordinate-value">-</span>°</div>
        <div>Longitude: <span id="lng" class="coordinate-value">-</span>°</div>
        <div>Height: <span id="height" class="coordinate-value">-</span> m</div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "position") {
        // Update UI with coordinates
        document.getElementById("lat").textContent = msg.lat?.toFixed(6) || "-";
        document.getElementById("lng").textContent = msg.lng?.toFixed(6) || "-";
        document.getElementById("height").textContent = msg.height?.toFixed(2) || "-";
      }
    });
  </script>
\`);

// Handle click events and send to UI for any map click
// You can test different mouse events specified in our developer documentation https://visualizer.developer.reearth.io/plugin-api/viewer/#mouse-events
reearth.viewer.on("click", (event) => {
  const { lat, lng, height } = event;

  // Send coordinates to UI for any click
  reearth.ui.postMessage({
    type: "position",
    lat: lat,
    lng: lng,
    height: height
  });
});
  `
};

export const mouseEvents: PluginType = {
  id: "mouse-events",
  files: [yamlFile, widgetFile]
};
