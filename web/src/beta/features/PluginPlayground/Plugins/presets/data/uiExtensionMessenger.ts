import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "messenger-between-extension-and-visualizer-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: messenger-between-extension-and-visualizer-plugin
name: Messenger between Extension and Visualizer
version: 1.0.0
extensions:
  - id: messenger-between-extension-and-visualizer
    type: widget
    name: Messenger Between Extension and Visualizer Widget
    description: Messenger between Extension and Visualizer Widget
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
  id: "messenger-between-extension-and-visualizer-widget",
  title: "messenger-between-extension-and-visualizer.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background p-16 rounded-sm flex-column gap-8">
      <div>
        <p class="text-3xl font-bold text-center">Coordinate Viewer</p>
        <button id="info-toggle" class="btn-neutral p-8">Show Info</button>
      </div>
      <div id="info-content" class="tertiary-background hidden p-8 rounded-sm">
        <strong>How to use this plugin:</strong><br>
        1. Click anywhere on the map to see its coordinates<br>
        2. Click the "Fly to Position" button to move the camera to that location<br>
        3. Coordinates update dynamically when you click anywhere on the map<br><br>
      </div>
      <div class="secondary-background p-16 rounded-sm">
        <p>Latitude: <span id="lat" class="font-monospace text-md">-</span>°</p>
        <p>Longitude: <span id="lng" class="font-monospace text-md">-</span>°</p>
      </div>
      <div class="flex-center">
        <button id="flyToButton" class="btn-primary p-8">Fly to Position</button>
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
      const isHidden = infoContent.style.display === "none" || !infoContent.style.display;
      infoContent.style.display = isHidden ? "block" : "none";
      document.getElementById("info-toggle").textContent = isHidden ? "Hide Info" : "Show Info";
    });
  </script>
\`);

// Send message to UI when globe is clicked
// Documentation on Viewer "on" event: https://visualizer.developer.reearth.io/plugin-api/viewer/#mouse-events
reearth.viewer.on("click", (event) => {
// Documentation on UI "postMessage" method: https://visualizer.developer.reearth.io/plugin-api/ui/#postmessage
  reearth.ui.postMessage({
    type: "position",
    lat: event.lat,
    lng: event.lng
  });
});

// Handle messages from UI to move camera
// Documentation on Extension "on" event: https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", msg => {
  if (msg.type === "fly") {
  // Documentation on Camera "flyTo" method: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
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
  id: "messenger-between-extension-and-visualizer",
  files: [yamlFile, widgetFile]
};
