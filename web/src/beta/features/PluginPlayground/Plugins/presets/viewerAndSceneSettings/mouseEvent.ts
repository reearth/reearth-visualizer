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
    .location-info {
      background: #fff;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }

    .coordinates {
      font-family: monospace;
      margin: 10px 0;
      line-height: 1.5;
    }

    .location-name {
      font-weight: bold;
      color: #333;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .coordinate-value {
      color: #666;
      margin-left: 5px;
    }
  </style>

  <div id="wrapper">
    <h2>Location Information</h2>
    <div class="location-info">
      <div id="locationName" class="location-name">
        Click a location to see details
      </div>
      <div class="coordinates">
        <div>Latitude: <span id="lat" class="coordinate-value">-</span>°</div>
        <div>Longitude: <span id="lng" class="coordinate-value">-</span>°</div>
        <div>Height: <span id="height" class="coordinate-value">-</span> m</div>
      </div>
    </div>
  </div>

  <script>
    // In the UI context, we can use fetch
    (async () => {
      try {
        const url = "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/tokyo_locations_sample.geojson";
        const response = await fetch(url);
        const data = await response.json();

        // Pass the data up to the plugin
        parent.postMessage(
          {
            type: "geojsonReady",
            data
          },
          "*"
        );
      } catch (err) {
        console.error("Failed to fetch GeoJSON:", err);
      }
    })();

    // Listen for position updates from plugin => display in UI
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "position") {
        document.getElementById("lat").textContent = msg.lat?.toFixed(6) ?? "-";
        document.getElementById("lng").textContent = msg.lng?.toFixed(6) ?? "-";
        document.getElementById("height").textContent = msg.height?.toFixed(2) ?? "-";
        document.getElementById("locationName").textContent =
          msg.name || "Click a location to see details";
      }
    });
  </script>
\`);

// Plugin listens for "geojsonReady"

let tokyoLocations = null;

reearth.extension.on("message", msg => {
  // If the UI has fetched data, store it
  if (msg.type === "geojsonReady") {
    tokyoLocations = msg.data;

    // Now that we have the data, add the layer
    reearth.layers.add({
      type: "simple",
      data: {
        type: "geojson",
        value: tokyoLocations, // Use "value" because we have the raw object
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
  }
});

// Camera setup
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

// Click handler with distance check
reearth.viewer.on("click", event => {
  const { lat, lng, height } = event;

  // If data not loaded yet, just show the clicked coords
  if (!tokyoLocations) {
    reearth.ui.postMessage({
      type: "position",
      lat,
      lng,
      height,
      name: null
    });
    return;
  }

  // Find the "closest" feature to the click
  const clickedFeature = tokyoLocations.features.find(feature => {
    const [featureLng, featureLat] = feature.geometry.coordinates;
    const distance = Math.sqrt(
      (featureLat - lat) ** 2 + (featureLng - lng) ** 2
    );
    return distance < 0.01;
  });

  // Send name + coords back to the UI
  reearth.ui.postMessage({
    type: "position",
    lat,
    lng,
    height,
    name: clickedFeature?.properties?.name || null
  });
});
  `
};

export const mouseEvents: PluginType = {
  id: "mouse-events",
  title: "Mouse Events",
  files: [widgetFile, yamlFile]
};
