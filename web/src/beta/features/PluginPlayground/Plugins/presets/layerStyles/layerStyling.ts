import { FileType, PluginType } from "../../constants";
// import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "layer-styling-manager-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layer-styling-manager-plugin
name: Layer Styling Manager
version: 1.0.0
extensions:
  - id: layer-styling-manager
    type: widget
    name: Layer Styling Manager
    description: Universal styling management for all layer formats
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layer-styling-manager",
  title: "layer-styling-manager.js",
  sourceCode: `
// Add initial point marker layer at specified coordinates
const currentLayerId = reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.97422779688281, 35.74642872517698],
            type: "Point",
          },
        },
      ],
    },
  },
  marker: {},
});

// Move camera to focus on the added point marker
reearth.camera.flyTo({
  lat: 35.74642872517698,
  lng: 139.97422779688281,
  height: 2000,
  heading: 0,
  pitch: -45,
  roll: 0
});

reearth.ui.show(\`
  <style>
    .wrapper {
      padding: 12px;
      background: #fff;
      border-radius: 4px;
    }
    .control-group {
      margin-bottom: 12px;
    }
    .control-label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
    }
    input {
      width: 100%;
      padding: 4px;
      margin-bottom: 8px;
    }
    button {
      width: 100%;
      padding: 8px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>

  <div class="wrapper">
    <div class="control-group">
      <label class="control-label">Point Color</label>
      <input type="color" id="pointColor" value="#ff0000" />
    </div>
    <div class="control-group">
      <label class="control-label">Point Size</label>
      <input type="number" id="pointSize" value="12" min="1" max="50" />
    </div>
    <div class="control-group">
      <label class="control-label">Outline Color</label>
      <input type="color" id="outlineColor" value="#ffffff" />
    </div>
    <div class="control-group">
      <label class="control-label">Outline Width</label>
      <input type="number" id="outlineWidth" value="1" min="0" max="10" />
    </div>
    <div class="control-group">
      <label class="control-label">Height</label>
      <input type="number" id="height" value="100" min="0" max="1000" />
    </div>
    <button onclick="updateStyle()">Update Style</button>
  </div>

  <script>
    function updateStyle() {
      parent.postMessage({
        type: "updateStyle",
        pointColor: document.getElementById("pointColor").value,
        pointSize: document.getElementById("pointSize").value,
        outlineColor: document.getElementById("outlineColor").value,
        outlineWidth: document.getElementById("outlineWidth").value,
        height: document.getElementById("height").value
      }, "*");
    }
  </script>
\`);

reearth.extension.on("message", msg => {
  if (msg.type === "updateStyle") {
    reearth.layers.override(currentLayerId, {
      marker: {
        style: "point",
        pointColor: msg.pointColor,
        pointSize: Number(msg.pointSize),
        pointOutlineColor: msg.outlineColor,
        pointOutlineWidth: Number(msg.outlineWidth),
        height: Number(msg.height),
        heightReference: "relative"
      }
    });
  }
});`
};

export const layerStylingManager: PluginType = {
  id: "layer-styling-manager",
  title: "Layer Style Manager",
  files: [widgetFile, yamlFile]
};
