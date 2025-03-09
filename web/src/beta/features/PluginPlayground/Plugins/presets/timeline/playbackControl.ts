import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "playback-control-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: playback-control-plugin
name: Playback Control
version: 1.0.0
extensions:
  - id: playback-control
    type: widget
    name: Playback Control
    description: Playback Control
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "playback-control",
  title: "playback-control.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .timeline-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
      padding: 16px;
    }

    .control-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn {
      padding: 6px 16px;
      border: none;
      border-radius: 4px;
      background: #2196F3;
      color: white;
      cursor: pointer;
    }

    .time-display-container {
      background: #fff;
      border-radius: 4px;
      padding: 8px;
      text-align: center;
    }

    .time-display {
      font-family: monospace;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .date-display {
      color: #666;
      font-size: 12px;
    }

    .time-value {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .speed-control {
      display: flex;
      align-items: center;
    }

    select {
      padding: 4px;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: white;
      font-size: 12px;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
      padding-top: 8px;
    }

    .radio-option {
      display: grid;
      grid-template-columns: auto 80px 1fr;
      align-items: baseline;
      gap: 4px;
    }

    .radio-description {
      color: #666;
      font-size: 11px;
    }

    .control-label {
      font-size: 12px;
      font-weight: bold;
    }
  </style>

  <div id="wrapper">
    <div class="timeline-controls">
      <div class="time-display-container">
        <div class="time-display">
          <div class="date-display" id="currentDate"></div>
          <div class="time-value" id="currentTime"></div>
        </div>
      </div>

      <div class="control-row">
        <button id="playPauseBtn" class="btn">Play</button>
        <div class="speed-control">
          <select id="speedSelect">
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
            <option value="20">20x</option>
            <option value="50">50x</option>
            <option value="100">100x</option>
            <option value="200">200x</option>
            <option value="500">500x</option>
            <option value="1000">1000x</option>
          </select>
        </div>
      </div>

      <div class="control-group">
        <div class="control-label">Range Type</div>
        <div class="radio-group">
          <div class="radio-option">
            <input type="radio" id="unbounded" name="rangeType" value="unbounded" checked>
            <label for="unbounded">Unbounded</label>
            <span class="radio-description"> - Time continues indefinitely in both directions.</span>
          </div>
          <div class="radio-option">
            <input type="radio" id="clamped" name="rangeType" value="clamped">
            <label for="clamped">Clamped</label>
            <span class="radio-description"> - Stops at the start/end of the time range.</span>
          </div>
          <div class="radio-option">
            <input type="radio" id="bounced" name="rangeType" value="bounced">
            <label for="bounced">Bounced</label>
            <span class="radio-description"> - Reverses direction at the start/end of time range.</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let isPlaying = false;

    // Initialize UI state
    function initializeUI() {
      document.getElementById("playPauseBtn").textContent = isPlaying ? "Pause" : "Play";
      document.getElementById("speedSelect").value = "1";
      document.getElementById("unbounded").checked = true;
    }

    // Play/Pause button handler
    document.getElementById("playPauseBtn").addEventListener("click", () => {
      isPlaying = !isPlaying;
      const button = document.getElementById("playPauseBtn");
      button.textContent = isPlaying ? "Pause" : "Play";

      parent.postMessage({
        type: "playback",
        action: isPlaying ? "play" : "pause"
      }, "*");
    });

    // Speed control handler
    document.getElementById("speedSelect").addEventListener("change", (e) => {
      parent.postMessage({
        type: "speed",
        value: parseFloat(e.target.value)
      }, "*");
    });

    // Range type handler
    document.querySelectorAll('input[name="rangeType"]').forEach(radio => {
      radio.addEventListener("change", (e) => {
        parent.postMessage({
          type: "rangeType",
          value: e.target.value
        }, "*");
      });
    });

    // Update time display function
    function updateTimeDisplay(timestamp) {
      const date = new Date(timestamp);

      // Update date display
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById("currentDate").textContent = date.toLocaleDateString(undefined, dateOptions);

      // Update time display
      document.getElementById("currentTime").textContent = date.toLocaleTimeString();
    }

    // Handle messages from extension
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "timeUpdate") {
        updateTimeDisplay(msg.time);
      } else if (msg.type === "stateUpdate") {
        if (msg.isPlaying !== undefined) {
          isPlaying = msg.isPlaying;
          document.getElementById("playPauseBtn").textContent = isPlaying ? "Pause" : "Play";
        }
        if (msg.speed !== undefined) {
          document.getElementById("speedSelect").value = msg.speed.toString();
        }
        if (msg.rangeType !== undefined) {
          document.querySelector(\\\`input[value="\\\${msg.rangeType}"]\\\`).checked = true;
        }
      }
    });

    // Initialize UI on load
    initializeUI();
  </script>
\`);

  // RE:EARTH API Implementation
  const timeline = reearth.timeline;
  let currentState = {
    isPlaying: false,
    speed: 1,
    rangeType: "unbounded"
  };

  // Define 3D Tiles layer with optimization settings
  const buildings3dTiles = {
    type: "simple",
    data: {
      type: "3dtiles",
      url: "https://assets.cms.plateau.reearth.io/assets/4a/c9fb39-9c97-4da6-af8f-e08751a2f269/14100_yokohama-shi_city_2023_citygml_1_op_bldg_3dtiles_14103_nishi-ku_lod2_no_texture/tileset.json",
    },
    "3dtiles": {
        pbr: false,
        selectedFeatureColor: "red",
        shadows: "enabled",
    }
  };

  // Add the 3D Tiles layer
  reearth.layers.add(buildings3dTiles);

  // Configure viewer for realistic day/night cycle
  reearth.viewer.overrideProperty({
    globe: {
      enableLighting: true,
      depthTestAgainstTerrain: true,
      atmosphere: {
        enabled: true,
        lightIntensity: 10.0,
        brightnessShift: 0.3
      }
    },
    terrain: {
      enabled: true
    },
    sky: {
      sun: {
        show: true
      },
      moon: {
        show: true
      },
      skyAtmosphere: {
        show: true,
        lightIntensity: 20.0,
        brightnessShift: 0.3,
        saturationShift: 0.2
      }
    },
    scene: {
      backgroundColor: "#87CEEB",
      light: {
        type: "sunLight",
        intensity: 10.0
      },
      shadow: {
        enabled: true,
        shadowMap: {
          size: 2048,
          softShadows: true
        }
      }
    }
});

  // Set camera position for optimal ground+sky view
  reearth.camera.flyTo({
    lat: 35.4562,
    lng: 139.6431,
    height: 450.7749,
    heading: 4.9,
    pitch: -0.20,
    roll: 6.2832
  }, {
    duration: 2
  });

  // Initialize timeline with real-time
  function initializeTimeline() {
    const now = new Date();

    // Start from current time
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);  // Start from beginning of current day

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);  // End at end of current day

    timeline.setTime?.({
      start: start,
      stop: end,
      current: now
    });

    timeline.setSpeed?.(currentState.speed);
    timeline.setRangeType?.(currentState.rangeType);

    reearth.ui.postMessage({
      type: "stateUpdate",
      ...currentState
    });
  }

  // Handle messages from UI
  reearth.extension.on("message", msg => {
    switch (msg.type) {
      case "playback":
        if (msg.action === "play") {
          timeline.play?.();
          currentState.isPlaying = true;
        } else {
          timeline.pause?.();
          currentState.isPlaying = false;
        }
        break;

      case "speed":
        timeline.setSpeed?.(msg.value);
        currentState.speed = msg.value;
        break;

      case "rangeType":
        timeline.setRangeType?.(msg.value);
        currentState.rangeType = msg.value;
        break;
    }

    reearth.ui.postMessage({
      type: "stateUpdate",
      ...currentState
    });
  });

  // Listen for timeline ticks
  timeline.on("tick", (time) => {
    reearth.ui.postMessage({
      type: "timeUpdate",
      time: time
    });
  });

  // Initialize the timeline
  initializeTimeline();
  `
};

export const playbackControl: PluginType = {
  id: "playback-control",
  files: [widgetFile, yamlFile],
  title: "Playback Control"
};
