import { FileType, PluginType } from "../../constants";

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
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="secondary-background primary-shadow p-16 rounded-sm">
    <div class="flex-column gap-8">
      <div class="primary-background p-8 rounded-sm">
        <div class="flex-column font-monospace">
          <div class="text-sm text-secondary" id="currentDate"></div>
          <div class="font-bold" id="currentTime"></div>
        </div>
      </div>

      <div class="display-flex gap-8">
        <button id="playPauseBtn" class="btn-primary w-8 h-4">Play</button>
        <div class="display-flex">
          <select class="p-4" id="speedSelect">
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
      <div>
        <div class="text-sm font-bold">Range Type</div>
        <div class="flex-column text-sm">
          <div class="display-grid radio-option gap-4">
            <input type="radio" id="unbounded" name="rangeType" value="unbounded" checked>
            <label for="unbounded">Unbounded</label>
            <span class="text-sm text-secondary"> - Time continues indefinitely in both directions.</span>
          </div>
          <div class="display-grid radio-option gap-4">
            <input type="radio" id="clamped" name="rangeType" value="clamped">
            <label for="clamped">Clamped</label>
            <span class="text-sm text-secondary"> - Stops at the start/end of the time range.</span>
          </div>
          <div class="display-grid radio-option gap-4">
            <input type="radio" id="bounced" name="rangeType" value="bounced">
            <label for="bounced">Bounced</label>
            <span class="text-sm text-secondary"> - Reverses direction at the start/end of time range.</span>
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
  // Documentation for Layers "add" method https://visualizer.developer.reearth.io/plugin-api/layers/#add
  reearth.layers.add(buildings3dTiles);

  // Configure viewer for realistic day/night cycle
  // Documentation for Viewer "overrideProperty" method https://visualizer.developer.reearth.io/plugin-api/viewer/#overrideproperty
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
  // Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
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
  // Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
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
  // Documentation for Timeline "tick" event https://visualizer.developer.reearth.io/plugin-api/timeline/#tick-1
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
  files: [yamlFile, widgetFile]
};
