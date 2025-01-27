import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "layers-show-features-info-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: show-features-info-plugin
name: Show Selected Features Information
version: 1.0.0
extensions:
  - id: show-features-info
    type: widget
    name: Show Selected Features Information Widget
    description: Selected Feature Information Widget
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "show-features-info",
  title: "show-features-info.js",
  sourceCode: `// Configure the UI side of the Plug-in
  reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
  .displayId {
      display: block;             
      width: 100%;               
      min-height: 52px;          
      background-color: #FAFAFA;
      border-radius: 4px;
      padding: 8px;
      word-wrap: break-word;      
      box-sizing: border-box;  
    }
.displayHeight {
  display: flex;              
  align-items: center;         
  width: 100%;
  min-height: 40px;
  background-color: #FAFAFA;
  border-radius: 4px;
  padding: 8px;
  word-wrap: break-word;
  box-sizing: border-box; 
}
.title{
    margin-bottom: 8px;     
  }
  </style>
    <div id="wrapper">
      <h3>Click to show building property</h3>
      <p class = "title"> Building ID </p>
      <span id="gml_id" class="displayId"></span>
      <p class = "title"> Building Height </p>
      <span id="building_height" class="displayHeight"</span>
    </div>
  <script>
    // Receive messages and display the building id and height
    window.addEventListener('message', function(e) {
      if (e.data?.action === "buildingClick") {
        const gmlId = e.data.payload?.gmlId || "";
        const buildingHeight = e.data.payload?.buildingHeight || "";
        const gml_id = document.getElementById("gml_id");
        gml_id.textContent = gmlId;
        if (buildingHeight) {
        building_height.textContent = buildingHeight + " m";
        }else {
        building_height.textContent = ""; 
        }       
      }
    });
  </script>
  \`);
// Plug-in UI side setting description completed

// Describe settings on Re:Earth (Web Assembly) side below

// Define 3D Tiles Layer
const layer3dTiles = {
  type: "simple", // Required
  data: {
    type: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/8b/cce097-2d4a-46eb-a98b-a78e7178dc30/13103_minato-ku_pref_2023_citygml_1_op_bldg_3dtiles_13103_minato-ku_lod2_no_texture/tileset.json", // URL of 3D Tiles
  },
  "3dtiles": {
    // Settings for the 3D Tiles style.
    pbr: false, //invalid Physically Based Rendering
    selectedFeatureColor: "red", // If you select a feature, it will change color
  },
};

// Add the 3D Tiles layer from the URL to Re:Earth
reearth.layers.add(layer3dTiles);

// Enable Terrain
reearth.viewer.overrideProperty({
  terrain: {
    enabled: true,
  },
});

// Define the camera position to be moved to
reearth.camera.flyTo(
  {
    heading: 4.022965234428543,
    height: 1616.524859060678,
    lat: 35.67170282368589,
    lng: 139.7707144962995,
    pitch: -0.464517599879275,
    roll: 6.283168638897022,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

// the function to send information about the selected feature to the plug-in
function handleLayerSelect(layerId, featureId) {
  // If nothing is selected, send an empty string
  if (!layerId || !featureId) {
    reearth.ui.postMessage({
      action: "buildingClick",
      payload: { gmlId: "",buildingHeight : ""},
    });
    return;
  }

  // Get information about the selected building (feature)
  const feature = reearth.layers.findFeatureById(layerId, featureId);
  const gml_id = feature?.properties?.gml_id || "";
  const building_height = feature?.properties?.["bldg:measuredHeight"] || "";

  // Send selected feature id and height to plugin UI
  reearth.ui.postMessage({
    action: "buildingClick",
    payload: { gmlId: gml_id ,buildingHeight : building_height},
  });
}
// Set "handleLayerSelect" to work when a feature is selected
reearth.layers.on("select", handleLayerSelect);`
};

export const showFeaturesInfo: PluginType = {
  id: "show-features-info",
  title: "Show Selected Features Information",
  files: [widgetFile, yamlFile]
};
