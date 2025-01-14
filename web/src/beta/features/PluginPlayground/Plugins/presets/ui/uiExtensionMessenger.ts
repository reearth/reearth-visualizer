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
    </style>

    <div id="wrapper">
      <h2>Coordinate Viewer</h2>
      <div class="coordinates">
        <p>Latitude: <span id="lat" class="coordinate-value">-</span>°</p>
        <p>Longitude: <span id="lng" class="coordinate-value">-</span>°</p>
        <p>Height: <span id="height" class="coordinate-value">-</span> m</p>
      </div>
      <div class="flex-center">
        <button id="flyToButton">Fly to Position</button>
      </div>
    </div>

    <script>
      let currentLat, currentLng, currentHeight;

      window.addEventListener("message", e => {
        const msg = e.data;
        if (msg.type === "position") {
          currentLat = msg.lat;
          currentLng = msg.lng;
          currentHeight = msg.height;

          document.getElementById("lat").textContent = msg.lat?.toFixed(6) || "-";
          document.getElementById("lng").textContent = msg.lng?.toFixed(6) || "-";
          document.getElementById("height").textContent = Math.abs(msg.height)?.toFixed(2) || "-";

        }
      });

      document.getElementById("flyToButton").addEventListener("click", () => {
        parent.postMessage({
          type: "fly",
          lat: currentLat,
          lng: currentLng,
          alt: Math.max(currentHeight, 1000)
        }, "*");
      });
    </script>
\`);

    // Setup the event listeners
    reearth.viewer.on("click", (event) => {
      reearth.ui.postMessage({
        type: "position",
        lat: event.lat,
        lng: event.lng,
        height: event.height
      });
    });

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
