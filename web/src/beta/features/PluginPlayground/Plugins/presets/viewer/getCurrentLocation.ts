import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "get-current-location-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: get-current-location-plugin
name: Get Current Location
version: 1.0.0
extensions:
  - id: get-current-location
    type: widget
    name: Get Current Location
    description: Get Current Location and Fly To
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "get-current-location",
  title: "get-current-location.js",
  sourceCode: `// This is sample code how to show user's current location

reearth.ui.show(\`
  <style>
  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>

  <div class="primary-background p-16 rounded-sm flex-column gap-8">
    <p class="text-3xl font-bold">Current Location</p>
    
    <div class="flex-center gap-8">
      <button id="getLocationBtn" class="btn-primary p-8">Get Location</button>
      <button id="flyToBtn" class="btn-success p-8" disabled>Fly To</button>
    </div>
    
    <p class="text-lg font-bold">Location Info</p>
    <div class="secondary-background p-4 rounded-sm">
      <div class="font-monospace">
        <div>Latitude: <span id="lat" class="font-bold">-</span>°</div>
        <div>Longitude: <span id="lng" class="font-bold">-</span>°</div>
        <div>Height: <span id="height" class="font-bold">-</span> m</div>
      </div>
    </div>
    
    <div id="statusMessage" class="message-display hidden"></div>
  </div>

  <script>
    let currentLat, currentLng, currentHeight;

    // Show status message
    function showStatus(message) {
      const statusMessage = document.getElementById("statusMessage");
      statusMessage.textContent = message;
      statusMessage.classList.remove("hidden");
      
      setTimeout(() => {
        statusMessage.classList.add("hidden");
      }, 3000);
    }

    // Handle messages from extension
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "position") {
        currentLat = msg.lat;
        currentLng = msg.lng;
        currentHeight = msg.height;

        document.getElementById("lat").textContent = msg.lat?.toFixed(6) || "-";
        document.getElementById("lng").textContent = msg.lng?.toFixed(6) || "-";
        document.getElementById("height").textContent = msg.height?.toFixed(2) || "-";
        
        document.getElementById("flyToBtn").disabled = false;
        showStatus("Location retrieved successfully!");
      } else if (msg.type === "error") {
        showStatus(msg.message);
      }
    });

    // Get current location button click handler
    document.getElementById("getLocationBtn").addEventListener("click", () => {
      parent.postMessage({
        type: "getCurrentLocation"
      }, "*");
    });

    // Fly to location button click handler
    document.getElementById("flyToBtn").addEventListener("click", () => {
      if (currentLat && currentLng) {
        parent.postMessage({
          type: "fly",
          lat: currentLat,
          lng: currentLng,
          height: currentHeight + 1000
        }, "*");
      }
    });
  </script>
\`);

// Handle button click to get current location
// Documentation for Viewer "getCurrentLocationAsync" function https://visualizer.developer.reearth.io/plugin-api/viewer/#-getcurrentlocationasync
reearth.extension.on("message", async (msg) => {
  if (msg.type === "getCurrentLocation") {
    const myLocation = await reearth.viewer.tools.getCurrentLocationAsync();
    
    if (myLocation) {
      reearth.ui.postMessage({
        type: "position",
        lat: myLocation.lat,
        lng: myLocation.lng,
        height: myLocation.height
      });
    } else {
      reearth.ui.postMessage({
        type: "error",
        message: "Could not retrieve location information"
      });
    }
  } else if (msg.type === "fly") {
    reearth.camera.flyTo(
      {
        lat: msg.lat,
        lng: msg.lng,
        height: msg.height
      },
      { duration: 2 }
    );
  }
});
  `
};

export const getCurrentLocation: PluginType = {
  id: "get-current-location",
  files: [yamlFile, widgetFile]
};
