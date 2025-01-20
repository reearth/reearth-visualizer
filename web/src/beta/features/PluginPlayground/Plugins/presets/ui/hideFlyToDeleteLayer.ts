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
  sourceCode: `
  
const layerGeojson = {
  type: "simple",
  title: "Points",
  data: {
    type: "geojson",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/sample_polygon_polyline_marker.geojson"
  },
  polygon: {
    fillColor: "red"
  },
  polyline: {
    strokeColor: "red"
  },
  marker: {
  }
};

const layer3dTiles = {
  type: "simple", // Required
  title: "3dtiles",
  data: {
    type: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/8b/cce097-2d4a-46eb-a98b-a78e7178dc30/13103_minato-ku_pref_2023_citygml_1_op_bldg_3dtiles_13103_minato-ku_lod2_no_texture/tileset.json" // URL of 3D Tiles
  },
  "3dtiles": {
    // Settings for the 3D Tiles style.
    pbr: false, 
    selectedFeatureColor: "red" // If you select a feature, it will change color
  }
};

reearth.layers.add(layerGeojson);
reearth.layers.add(layer3dTiles);
console.log("Total number of layers:", reearth.layers.layers);

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
        padding: 4px 8px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      button:hover {
        background: #45a049;
      }
    </style>

    <div id="wrapper">
      <h2>Layers</h2>
      <ul class="layers-list">
      <li>
         <span id="layer-name" >one</span>
         <div class="actions">
          <span id="show-hide-layer">💡</span>
          <span id="flyTo">🏠</span>
         <button id="show-hide-layer">Delete</button>
        </div> 
      </li>
      <li>
         <span id="layer-name" >one</span>
         <div class="actions">
          <span id="show-hide-layer">💡</span>
          <span id="flyTo">🏠</span>
         <button id="show-hide-layer">Delete</button>
        </div> 
      </li>
      <li>
         <span id="layer-name" >one</span>
         <div class="actions">
          <span id="show-hide-layer">💡</span>
          <span id="flyTo">🏠</span>
         <button id="show-hide-layer">Delete</button>
        </div> 
      </li>
      </ul>
    </div>

    <script>
    </script>
\`);

`
};

export const hideFlyToDeleteLayer: PluginType = {
  id: "hide-flyto-delete-layer",
  title: "Hide Flyto Delete Layer",
  files: [widgetFile, yamlFile]
};
