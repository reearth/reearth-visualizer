import { FileType, PluginType } from "../../constants";

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
  // This plugin provides a simple interface for camera position management in Re:Earth.
  // It allows users to:
  // 1. Retrieve the current camera position
  // 2. Manually input and apply a new camera position
  // 3. Smoothly transition the camera to specified coordinates and angles


  reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background flex-column rounded-sm gap-8 p-8">
        <div>
          <p class="text-3xl font-bold text-center mb-8">Camera Position</p>
          <button id="info-toggle" class="btn-neutral w-10 h-4">Show Info</button>
        </div>
        <div class="tertiary-background hidden rounded-sm text-sm p-8" id="info-content">
          <strong>How to Use the Plugin</strong><br><br>
          1. <strong>Automatic Tracking</strong><br>
          • Move the camera around the globe<br>
          • Input fields will automatically update with current camera position<br><br>
          2. <strong>Manual Positioning</strong><br>
          • Enter desired values in any of the input fields<br>
          • Click "Apply Position"<br>
          • Camera will instantly move to the specified location.
        </div>

      <div class="secondary-background flex-column rounded-sm p-16 gap-8">
        <div class="flex-column gap-4">
          <label class="font-bold" for="lat">Latitude</label>
          <input type="number" id="lat" step="0.0001">
        </div>
        <div class="flex-column gap-4">
          <label class="font-bold" for="lng">Longitude</label>
          <input type="number" id="lng" step="0.0001">
        </div>
        <div class="flex-column gap-4">
          <label class="font-bold" for="height">Height (meters)</label>
          <input type="number" id="height" step="1">
        </div>
        <div class="flex-column gap-4">
          <label class="font-bold" for="heading">Heading (radians)</label>
          <input type="number" id="heading" step="0.1">
        </div>
        <div class="flex-column gap-4">
          <label class="font-bold" for="pitch">Pitch (radians)</label>
          <input type="number" id="pitch" step="0.1">
        </div>
        <div class="flex-column gap-4">
          <label class="font-bold" for="roll">Roll (radians)</label>
          <input type="number" id="roll" step="0.1">
        </div>

        <div class="display-flex justify-center">
          <button class="btn-primary w-14 h-5" id="apply-btn" disabled>Apply Position</button>
        </div>
        <div id="status-message" class="text-secondary"></div>
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
    const isHidden = infoContent.style.display === 'none' || !infoContent.style.display;

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

// Documentation on Camera "on" event: https://visualizer.developer.reearth.io/plugin-api/camera/#move-1
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

// Documentation on Extension "on" event: https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on('message', (msg) => {
  // Apply camera position
  if (msg.type === 'applyCameraPosition') {
    const params = msg.position;

    // Get current camera position before flying
    const currentPosition = reearth.camera.position || {};

    // Check if the new position is actually different
    const isPositionChanged = Object.keys(params).some(key =>
    //Use a tolerance threshold to compare floating-point values
      Math.abs((currentPosition[key] || 0) - (params[key] || 0)) > 0.0001
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
      // Documentation on UI "postMessage" event: https://visualizer.developer.reearth.io/plugin-api/ui/#postmessage
      reearth.ui.postMessage({
        type: 'positionApplied'
      });
    }
  }
});`
};

export const cameraPosition: PluginType = {
  id: "camera-position",
  files: [yamlFile, widgetFile]
};
