import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "ui-extension-messenger-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: ui-extension-messenger-plugin
name: UI Extension Messenger
version: 1.0.0
extensions:
  - id: ui-extension-messenger
    type: widget
    name: UI Extension Messenger Widget
    description: UI Extension Messenger Widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: center
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "ui-extension-messenger-widget",
  title: "ui-extension-messenger.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
    <style>
      .coordinates {
        background: #fff;
        padding: 15px;
        border-radius: 5px;
        margin: 10px 0;
      }

      .coordinate-value {
        font-family: monospace;
        color: #444;
      }

      button {
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      button:hover {
        background: #45a049;
      }

      #info-section {
        margin: 20px 0;
        text-align: left;
      }

      #info-toggle {
        padding: 6px 12px;  /* Smaller button */
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;    /* Smaller text */
      }

      #info-content {
        background: #f9f9f9;  /* Light gray background */
        padding: 10px;
        border-radius: 5px;
        margin-top: 15px;    /* Space between button and content */
        font-size: 14px;
        line-height: 1.4;
      }
    </style>

    <div id="wrapper">
      <h2>Coordinate Viewer</h2>
      <div id="info-section">
        <button id="info-toggle">Show Info</button>
        <div id="info-content" style="display: none;">
          <strong>How to use this plugin:</strong><br>
          1. Click anywhere on the map to see its coordinates<br>
          2. Click the "Fly to Position" button to move the camera to that location<br>
          3. Coordinates update dynamically when you click anywhere on the map<br><br>
        </div>
      </div>
      <div class="coordinates">
        <p>Latitude: <span id="lat" class="coordinate-value">-</span>°</p>
        <p>Longitude: <span id="lng" class="coordinate-value">-</span>°</p>
      </div>
      <div class="flex-center">
        <button id="flyToButton">Fly to Position</button>
      </div>
    </div>

    <script>
      let currentLat, currentLng;

      // Handle messages from extension
      window.addEventListener("message", e => {
        const msg = e.data;
        if (msg.type === "position") {
          currentLat = msg.lat;
          currentLng = msg.lng;

          document.getElementById("lat").textContent = msg.lat?.toFixed(6) || "-";
          document.getElementById("lng").textContent = msg.lng?.toFixed(6) || "-";
        }
      });

      // Send message to extension when button is clicked
      document.getElementById("flyToButton").addEventListener("click", () => {
        parent.postMessage({
          type: "fly",
          lat: currentLat,
          lng: currentLng,
          alt: 1000 // Fixed camera height for better viewing
        }, "*");
      });

      // Toggle info section
      document.getElementById("info-toggle").addEventListener("click", () => {
        const infoContent = document.getElementById("info-content");
        const isHidden = infoContent.style.display === "none";
        infoContent.style.display = isHidden ? "block" : "none";
        document.getElementById("info-toggle").textContent = isHidden ? "Hide Info" : "Show Info";
      });
    </script>
\`);

// Send message to UI when globe is clicked
reearth.viewer.on("click", (event) => {
  reearth.ui.postMessage({
    type: "position",
    lat: event.lat,
    lng: event.lng
  });
});

// Handle messages from UI to move camera
reearth.extension.on("message", msg => {
  if (msg.type === "fly") {
    reearth.camera.flyTo(
      {
        lat: msg.lat,
        lng: msg.lng,
        height: msg.alt
      },
      { duration: 2 }
    );
  }
});`
};

export const uiExtensionMessenger: PluginType = {
  id: "ui-extension-messenger",
  title: "UI Extension Messenger",
  files: [widgetFile, yamlFile]
};
