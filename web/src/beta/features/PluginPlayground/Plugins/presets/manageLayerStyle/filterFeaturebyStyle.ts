import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "filter-features-with-style-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: filter-features-with-style-plugin
name: Filter features with style
version: 1.0.0
extensions:
  - id: filter-features-with-style
    type: widget
    name: Filter features with style
    description: Filter features with style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "filter-features-with-style",
  title: "filter-features-with-style.js",
  sourceCode: `// This example demonstrates how to filter features with style

// Click the buttons to filter points based on the years 

// Define the plug-in UI //
reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    button {
      padding: 4px 8px;
      border: 1px solid black;
      border-radius: 4px;
      cursor: pointer;
      background-color: white;
      transition: background-color 0.3s ease;
    }
    .active {
      background: #4CAF50;
      color: white;;
      border: none;
      color: white;
    }
    .button-container {
      display: flex;
      gap: 10px;
    }
  </style>
  <div id="wrapper">
    <h2>Filter Point by year</h2>
    <div class="button-container">
      <button id="allBtn">Show all</button>
      <button id="beforeBtn">Before year 2000</button>
      <button id="afterBtn">After year 2000</button>
    </div>
  </div>

  <script>
    const buttons = document.querySelectorAll(".button-container button");

    function setActiveButton(activeId) {
      buttons.forEach(btn => {
        if (btn.id === activeId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        setActiveButton(button.id);
        parent.postMessage({ action: button.id === "allBtn" ? "showAllFeatures" :
        button.id === "beforeBtn" ? "showFeaturesBefore2000" : "showFeaturesAfter2000" }, "*");
      });
    });
  </script>
\`);



// Define a geojson point data
const samplePointData = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/sample_japan_heritage_marker.geojson"
    
  },
  marker: {},
};

// Add the layer to Re:Earth
const layerId = reearth.layers.add(samplePointData);

// Move the camera to the specified position
reearth.camera.flyTo(
  {
    // Define the camera's target position
    heading: 6.283185307179586,
    height: 1727266.2174338317,
    lat: 23.557153805931208,
    lng: 135.51326178467858,
    pitch: -0.9940806763270689,
    roll: 6.283185307179582
  },
  {
    // Define the duration of the camera movement (in seconds)
    duration: 2.0,
  }
);

// Listen for messages from the UI and override the style for "Cool Style or "Warm Style"
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "showAllFeatures") {
    reearth.layers.override(layerId, {
      marker: {
        show: true,
      },
    });
  } else if (action === "showFeaturesBefore2000") {
    reearth.layers.override(layerId, {
      marker: {
        show: {
          expression: {
            conditions: [
              ["\${year} > 2000", "false"],
              ["\${year} <= 2000", "true"],
            ],
          },
        },
      },
    });
  }
     else if (action === "showFeaturesAfter2000") {
    reearth.layers.override(layerId, {
      marker: {
        show: {
          expression: {
            conditions: [
              ["\${year} <= 2000", "false"],
              ["\${year} > 2000", "true"],
            ],
          },
        },
      },
    });
  }
})`
};

export const filterFeatureWithStyle: PluginType = {
  id: "filter-features-with-style",
  title: "Filter Features with Style",
  files: [widgetFile, yamlFile]
};
