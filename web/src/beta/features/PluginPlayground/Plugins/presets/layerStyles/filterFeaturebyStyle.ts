import { FileType, PluginType } from "../../constants";

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

// Click the buttons to filter cities based on the population

// Define the plug-in UI //
reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background flex-column gap-8 p-16 rounded-sm">
    <p class="text-lg font-bold">Filter Cities based on Population:</p>
    <div class="flex-column justify-center gap-8">
      <button class="btn-neutral btn-success p-8" id="allBtn">Show all</button>
      <button class="btn-neutral p-8" id="belowBtn">Population below 20000</button>
      <button class="btn-neutral p-8" id="aboveBtn">Population above 20000</button>
    </div>
  </div>

  <script>
    const buttons = document.querySelectorAll("button");

    function setActiveButton(activeId) {
      buttons.forEach(btn => {
        if (btn.id === activeId) {
          btn.classList.add("btn-success");
        } else {
          btn.classList.remove("btn-success");
        }
      });
    }

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        setActiveButton(button.id);
        parent.postMessage({ action: button.id === "allBtn" ? "showAllFeatures" :
        button.id === "belowBtn" ? "showFeaturesBelow20000" : "showFeaturesAbove20000" }, "*");
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
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/sample_population_marker.geojson"

  },
  marker: {
    label: true,
    labelBackground: true,
    labelBackgroundColor: "#00000080",
    labelPosition: "top",
    labelText: {
      expression: "${ls_name}",
    },
    labelTypography: {
      color: "#FFFFFF",
      fontSize: 10,
    },
  },
};

// Add the layer to Re:Earth
// Documentation for Layers "add" method https://visualizer.developer.reearth.io/plugin-api/layers/#add
const layerId = reearth.layers.add(samplePointData);

// Move the camera to the specified position
// Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  {
    // Define the camera's target position
  heading: 6.283185307179586,
  height: 2308186.843368756,
  lat: -32.389771622286766,
  lng: 46.5725045061546,
  pitch: -1.0274739891405908,
  roll: 6.283185307179586
  },
  {
    // Define the duration of the camera movement (in seconds)
    duration: 2.0,
  }
);

// Listen for messages from the UI and override the style
// Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "showAllFeatures") {
    reearth.layers.override(layerId, {
      marker: {
        show: true,
      },
    });
  } else if (action === "showFeaturesBelow20000") {
  // Documentation for Layers "override" method https://visualizer.developer.reearth.io/plugin-api/layers/#override
    reearth.layers.override(layerId, {
      marker: {
        show: {
          expression: {
            conditions: [
              ["\${pop_max} > 20000", "false"],
              ["\${pop_max} <= 20000", "true"],
            ],
          },
        },
      },
    });
  }
     else if (action === "showFeaturesAbove20000") {
    reearth.layers.override(layerId, {
      marker: {
        show: {
          expression: {
            conditions: [
              ["\${pop_max} <= 20000", "false"],
              ["\${pop_max} > 20000", "true"],
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
  files: [yamlFile, widgetFile]
};
