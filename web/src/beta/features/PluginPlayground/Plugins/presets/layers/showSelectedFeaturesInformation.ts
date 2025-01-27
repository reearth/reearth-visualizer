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
  id: "show-features-info",
  title: "show-features-info.js",
  sourceCode: `reearth.ui.show(\`
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
      margin-top: 10px; 
    }

  </style>
    <div id="wrapper">
      <h3>Click to show Building ID</h3>
      <span id="message" class="displayId"></span></p>
    </div>
  <script>
    // プラグイン側からのメッセージを受け取って、建物IDを表示する
    window.addEventListener('message', function(e) {
      if (e.data?.action === "buildingClick") {
        const gmlId = e.data.payload?.gmlId || "";
        const messageEl = document.getElementById("message");
        messageEl.textContent = gmlId;
        
      }
    });
  </script>
  \`);
  
  // Add 3D Tiles Layer
  const layer3dTiles = {
  type: "simple", // Required
  data: {
    type: "3dtiles",
    url: "https://assets.cms.plateau.reearth.io/assets/8b/cce097-2d4a-46eb-a98b-a78e7178dc30/13103_minato-ku_pref_2023_citygml_1_op_bldg_3dtiles_13103_minato-ku_lod2_no_texture/tileset.json", // URL of 3D Tiles
  },
  "3dtiles": { // Settings for the 3D Tiles style.
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

reearth.camera.flyTo(
  // Define the camera position to be moved to
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

  function handleLayerSelect(layerId, featureId) {
    if (!layerId || !featureId) {
      // 何も選択されていない場合は空文字を送る
      reearth.ui.postMessage({
        action: "buildingClick",
        payload: { gmlId: "" },
      });
      return;
    }

    // 選択された建物(feature)の情報を取得
    const feature = reearth.layers.findFeatureById(layerId, featureId);
    const gml_id = feature?.properties?.gml_id || "";

    // プラグインUIに選択されたIDを送信する
    reearth.ui.postMessage({
      action: "buildingClick",
      payload: { gmlId: gml_id },
    });
  }

  reearth.layers.on("select", handleLayerSelect);
  `
};

export const showFeaturesInfo: PluginType = {
  id: "show-features-info",
  title: "Show Selected Features Information",
  files: [widgetFile, yamlFile]
};
