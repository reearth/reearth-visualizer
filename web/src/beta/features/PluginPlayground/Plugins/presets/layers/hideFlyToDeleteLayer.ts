import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "ui-hide-flyto-delete-layer-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: hide-flyto-delete-layer-plugin
name: Hide Flyto Delete Layer
version: 1.0.0
extensions:
  - id: hide-flyto-delete-layer
    type: widget
    name: Hide Flyto Delete Layer Widget
    description: Hide Flyto Delete Layer Widget
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
  id: "hide-flyto-delete-layer-widget",
  title: "hide-flyto-delete-layer.js",
  sourceCode: `const layerGeojson = {
  type: "simple",
  title: "sample",
  visible: true,
  data: {
    type: "geojson",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/sample_polygon_polyline_marker.geojson"
  },
  polygon: {},
  polyline: {},
  marker: {}
};

const layer3dTiles = {
  type: "simple",
  title: "3dtiles",
  visible: true,
  data: {
    type: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/8b/cce097-2d4a-46eb-a98b-a78e7178dc30/13103_minato-ku_pref_2023_citygml_1_op_bldg_3dtiles_13103_minato-ku_lod2_no_texture/tileset.json"
  },
  "3dtiles": {
    pbr: false, 
    selectedFeatureColor: "red"
  }
};

const pluginGeojsonLayerId = reearth.layers.add(layerGeojson);
const plugin3dTilesLayerId = reearth.layers.add(layer3dTiles);
const layers = reearth.layers.layers

// filter layers
const pluginLayerIds = [plugin3dTilesLayerId, pluginGeojsonLayerId];
const presetLayers = layers.filter(layer => !pluginLayerIds.includes(layer.id));
const pluginLayers = layers.filter(layer => pluginLayerIds.includes(layer.id));

const generateLayerItem = (layer, isPreset) => {
  return \`
    <li>
      <span id="layer-name">\${layer.title}</span>
      <div class="actions">
        <input 
          type="checkbox" 
          id="show-hide-layer" 
          data-layer-id="\${layer.id}"
          $\{layer.visible ? "checked" : ""} 
        />
        <button class="fly-to-layer" data-layer-id="\${layer.id}">Flyto</button>
        $\{!isPreset
            ? \`<button class="delete-layer"  data-layer-id="\${layer.id}">Delete</button>\`
            : "" }
      </div>
    </li>
  \`;
};

const presetLayerItems = presetLayers.map(layer => generateLayerItem(layer, true)).join('');
const pluginLayerItems = pluginLayers.map(layer => generateLayerItem(layer, false)).join('');

reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
<style>
  .layers-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .layers-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  #layer-name{
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0
  }
  .actions{
    display: flex;
    gap: 8px;
    align-items: center;
    }

  button {
    padding: 2px 4px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #45a049;
  }

  .fly-to-layer, #show-hide-layer{
    cursor: pointer;
  }
</style>

<div id="wrapper">
  <h2>Layers</h2>

  <h3>Preset Layers</h3>
  <ul class="layers-list">
    \${presetLayerItems}
  </ul>

  <h3>Plugin Layers</h3>
  <ul class="layers-list">
    \${pluginLayerItems}
  </ul>
</div>

<script>
  // Add event listener for 'Delete' button
  document.querySelectorAll(".delete-layer").forEach(button => {
    button.addEventListener("click", event => {
      const layerId = event.target.getAttribute("data-layer-id");
      if (layerId) {
        // Send a message to the parent window when 'Delete' is clicked
        parent.postMessage({
          type: "delete",
          layerId: layerId
        }, "*");
        // Remove the layer from the UI
        event.target.closest("li").remove();
      }
    });
  });

  // Add event listener for 'Show/Hide' 
  document.querySelectorAll("#show-hide-layer").forEach(checkbox => {
    checkbox.addEventListener("change", event => {
      const layerId = event.target.getAttribute("data-layer-id");
      const isVisible = event.target.checked;

      if (layerId) {
        // Send a message to the parent window for show/hide action
        parent.postMessage({
          type: isVisible ? "show" : "hide",
          layerId: layerId
        }, "*");
      }
    });
  });

    // Add event listener for 'FlyTo' button
  document.querySelectorAll(".fly-to-layer").forEach(button => {
    button.addEventListener("click", event => {
      const layerId = event.target.getAttribute("data-layer-id");
      if (layerId) {
        // Send a message to the parent window for 'FlyTo' action
        parent.postMessage({
          type: "flyTo",
          layerId: layerId
        }, "*");
      }
    });
  });
</script>
\`);

reearth.extension.on("message", (msg) => {
  switch (msg.type) {
    case "delete":
      reearth.layers.delete(msg.layerId);
      break;
    case "flyTo":
      reearth.camera.flyTo(msg.layerId, { duration: 2 });
      break;
    case "hide":
      reearth.layers.hide(msg.layerId);
      break;
    case "show":
      reearth.layers.show(msg.layerId);
      break;
    default:
  }
});
`
};

export const hideFlyToDeleteLayer: PluginType = {
  id: "hide-flyto-delete-layer",
  title: "Hide/Flyto/Delete Layer",
  files: [widgetFile, yamlFile]
};
