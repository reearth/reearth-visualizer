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
    #info-section {
      position: sticky;
      top: 0;
      background: #eee;
      text-align: left;
    }

    .camera-controls {
      background-color: white;
      border-radius: 5px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .info-expanded .camera-controls {
      max-height: 250px;
      overflow-y: auto;
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

    #apply-btn {
      background-color: #2196F3;
      opacity: 0.5;
      cursor: not-allowed;
    }

    #apply-btn:not(:disabled) {
      opacity: 1;
      cursor: pointer;
    }

    #apply-btn:not(:disabled):active {
      background-color: #1976D2;
    }

    .status-message {
      text-align: center;
      color: #666;
      height: 4px;
      padding: 4px;
    }

    #info-section {
      margin: 8px 0;
      text-align: left;
    }

    #info-toggle {
      padding: 6px 8px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    #info-content {
      background: #f9f9f9;
      padding: 10px;
      border-radius: 5px;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.3;
    }
  </style>

  <div id="wrapper">
    <div class="scrollable-content">
      <div id="info-section">
        <button id="info-toggle">Show Info</button>
        <div id="info-content" style="display: none;">
          <strong>How to Use the Plugin</strong><br><br>
          1. <strong>Automatic Tracking</strong><br>
          • Move the camera around the globe<br>
          • Input fields will automatically update with current camera position<br><br>
          2. <strong>Manual Positioning</strong><br>
          • Enter desired values in any of the input fields<br>
          • Click "Apply Position"<br>
          • Camera will instantly move to the specified location.
        </div>
      </div>

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
          <button id="apply-btn" disabled>Apply Position</button>
        </div>
        <div id="status-message" class="status-message"></div>
      </div>
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

  const applyBtn = document.getElementById('apply-btn');
  const statusMessage = document.getElementById('status-message');

  // Function to check if any input has a value
  function checkInputs() {
    const hasInput = Object.values(inputs).some(input => input.value.trim() !== '');
    applyBtn.disabled = !hasInput;
    applyBtn.style.opacity = hasInput ? '1' : '0.5';
    applyBtn.style.cursor = hasInput ? 'pointer' : 'not-allowed';
  }

  // Add event listeners to all inputs
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', checkInputs);
  });

  // Initial check
  checkInputs();

  // Toggle info section
  document.getElementById('info-toggle').addEventListener('click', () => {
    const infoContent = document.getElementById('info-content');
    const wrapper = document.getElementById('wrapper');
    const isHidden = infoContent.style.display === 'none';

    infoContent.style.display = isHidden ? 'block' : 'none';
    wrapper.classList.toggle('info-expanded', isHidden);
    document.getElementById('info-toggle').textContent = isHidden ? 'Hide Info' : 'Show Info';
  });

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

        // Recheck inputs after automatic update
        checkInputs();
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

    // Get current camera position before flying
    const currentPosition = reearth.camera.position || {};

    // Check if the new position is actually different
    const isPositionChanged = Object.keys(params).some(key =>
      currentPosition[key] !== params[key]
    );

    if (isPositionChanged) {
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
  }
});`
};

export const cameraPosition: PluginType = {
  id: "camera-position",
  title: "Camera Position",
  files: [widgetFile, yamlFile]
};
