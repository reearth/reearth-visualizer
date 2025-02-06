import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "camera-position-yml",
  title: "reearth.yml",
  sourceCode: `id: camera-position-plugin
name: Camera Position
version: 1.0.0
extensions:
  - id: camera-position
    type: widget
    name: Camera Position Widget
    description: Widget for controlling camera position
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
  id: "camera-position-widget",
  title: "camera-position.js",
  sourceCode: `
  // This plugin provides a simple interface for camera position management in ReEarth.
  // It allows users to:
  // 1. Retrieve the current camera position
  // 2. Manually input and apply a new camera position
  // 3. Smoothly transition the camera to specified coordinates and angles


  reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .camera-controls {
      background-color: white;
      border-radius: 5px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-group {
      margin-bottom: 4px;
    }

    .input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .input-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .button-group {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding-top: 12px;
      margin: 0;
    }

    button {
      padding: 12px;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }

    #refresh-btn {
      background-color: #4CAF50;
    }

    #apply-btn {
      background-color: #2196F3;
    }

    #refresh-btn:active {
      background-color: #45a049;
    }

    #apply-btn:active {
      background-color: #1976D2;
    }

    .status-message {
      text-align: center;
      color: #666;
      height: 4px;
      padding-top: 4px;
    }
  </style>

  <div id="wrapper">
    <div class="camera-controls">
      <div class="input-group">
        <label for="lat">Latitude</label>
        <input type="number" id="lat" step="0.0001">
      </div>
      <div class="input-group">
        <label for="lng">Longitude</label>
        <input type="number" id="lng" step="0.0001">
      </div>
      <div class="input-group">
        <label for="height">Height (meters)</label>
        <input type="number" id="height" step="1">
      </div>
      <div class="input-group">
        <label for="heading">Heading (radians)</label>
        <input type="number" id="heading" step="0.1">
      </div>
      <div class="input-group">
        <label for="pitch">Pitch (radians)</label>
        <input type="number" id="pitch" step="0.1">
      </div>
      <div class="input-group">
        <label for="roll">Roll (radians)</label>
        <input type="number" id="roll" step="0.1">
      </div>

      <div class="button-group">
        <button id="apply-btn">Apply Position</button>
      </div>
      <div id="status-message" class="status-message"></div>
    </div>
  </div>

  <script>
    let preserveManualInput = null;

    const inputs = {
      lat: document.getElementById('lat'),
      lng: document.getElementById('lng'),
      height: document.getElementById('height'),
      heading: document.getElementById('heading'),
      pitch: document.getElementById('pitch'),
      roll: document.getElementById('roll')
    };

    const statusMessage = document.getElementById('status-message');

    // Apply camera position
    document.getElementById('apply-btn').addEventListener('click', () => {
      preserveManualInput = true;
      const cameraParams = {};

      // Collect ALL input values
      Object.keys(inputs).forEach(key => {
        const value = inputs[key].value.trim();
        if (value !== '') {
          cameraParams[key] = Number(value);
        }
      });

      // Send message to apply camera position
      parent.postMessage({
        type: 'applyCameraPosition',
        position: cameraParams
      }, '*');
    });

    // Handle messages from extension
    window.addEventListener('message', (e) => {
      if (e.data.type === 'currentPosition') {
        // Only update if not preserving manual input
        if (!preserveManualInput) {
          const position = e.data.position;

          // Update input fields
          Object.keys(inputs).forEach(key => {
            if (position[key] !== undefined) {
              inputs[key].value = Number(position[key]).toFixed(4);
            } else {
              inputs[key].value = '';
            }
          });
        } else {
          // Reset the flag after one update
          preserveManualInput = false;
        }
      } else if (e.data.type === 'positionApplied') {
        // Show status message for successful application
        statusMessage.textContent = 'Camera position applied!';
      }
    });
  </script>
\`);

reearth.camera.on("move", (camera) => {
  reearth.ui.postMessage({
    type: 'currentPosition',
    position: {
      lat: camera.lat,
      lng: camera.lng,
      height: camera.height,
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll
    }
  });
});

reearth.extension.on('message', (msg) => {
  // Apply camera position
  if (msg.type === 'applyCameraPosition') {
    const params = msg.position;

    reearth.camera.flyTo(
      params,
      {
        duration: 0,
        easing: (t) => t * t
      }
    );

    // Send confirmation message
    reearth.ui.postMessage({
      type: 'positionApplied'
    });
  }
});
  `
};

export const cameraPosition: PluginType = {
  id: "camera-position",
  title: "Camera Position",
  files: [widgetFile, yamlFile]
};
