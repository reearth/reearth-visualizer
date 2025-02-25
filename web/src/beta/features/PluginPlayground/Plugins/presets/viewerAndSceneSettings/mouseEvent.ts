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
      <div class="coords-title">Click on a location to see coordinates:</div>
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
        // Update UI with coordinates only
        document.getElementById("lat").textContent = msg.lat?.toFixed(6) || "-";
        document.getElementById("lng").textContent = msg.lng?.toFixed(6) || "-";
        document.getElementById("height").textContent = msg.height?.toFixed(2) || "-";
      }
    });
  </script>
\`);

// Add locations layer using the hosted GeoJSON URL and store the layer ID
const locationsLayerId = reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/tokyo_locations_sample.geojson"
  },
  marker: {
    height: 1000,
    heightReference: "relative",
    pointColor: "#E9373D",
    pointOutlineColor: "white",
    pointOutlineWidth: 2,
    pointSize: 15,
    style: "point"
  }
});

// Initial camera position
reearth.camera.flyTo(
  {
    lat: 35.6762,
    lng: 139.7503,
    height: 50000,
    heading: 0,
    pitch: -1.5,
    roll: 0
  },
  { duration: 2 }
);

// Handle click events and send to UI only when a location is clicked
reearth.viewer.on("click", (event) => {
  const { lat, lng, height, layerId } = event;

  // Check if the clicked layer is our locations layer or one of its features
  if (layerId && (layerId === locationsLayerId || layerId.startsWith(locationsLayerId + "-"))) {
    // Send coordinates to UI only when a landmark is clicked
    reearth.ui.postMessage({
      type: "position",
      lat: lat,
      lng: lng,
      height: height
    });
  }
});
  `
};

export const mouseEvents: PluginType = {
  id: "mouse-events",
  title: "Mouse Events",
  files: [widgetFile, yamlFile]
};
