import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "override-style-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: override-style-plugin
name: Override style
version: 1.0.0
extensions:
  - id: override-style
    type: widget
    name: Override style
    description: Override style
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "override-style",
  title: "override-style.js",
  sourceCode: `// This example demonstrates how to override feature style

// Define Plug-in UI //
reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .scaleBtn {
      padding: 8px;
      border-radius: 4px;
      border: none;
      background: #fffafa;
      color: #000000;
      cursor: pointer;
      width: 200px;
      height: 40px;
      font-size: 16px 
    }
    .scaleBtn:active {
      background: #dcdcdc;
    }

    .button-container {
    display: flex;        
    gap: 8px;           
    }

    p {
      text-align: center; 
    }

  </style>
  <div id="wrapper">
    <h2>Color by Height</h2>
    <p>Choose your preferred color scheme<p>
    <div class="button-container">
      <button class = "scaleBtn"id="cool">Cool Style</button>
      <button class = "scaleBtn" id="warm">Warm Style</button>
    </div>
  </div>
  
  <script>
  const coolStyle = document.getElementById("cool");
  const warmStyle  = document.getElementById("warm");

  
  coolStyle.addEventListener("click",() =>{
    parent.postMessage({
      action: "updateStylyCool",
    }, "*");
    })
  
  warmStyle.addEventListener("click",() =>{
    parent.postMessage({
      action: "updateStylyWarm",
    }, "*");
    })
  </script>
  \`);

// Define a 3D Tiles layer
const sample3dTiles = {
  type: "simple", // Required
  data: {
    type: "3dtiles", // Data type
    url: "https://assets.cms.plateau.reearth.io/assets/8b/cce097-2d4a-46eb-a98b-a78e7178dc30/13103_minato-ku_pref_2023_citygml_1_op_bldg_3dtiles_13103_minato-ku_lod2_no_texture/tileset.json", // URL of the 3D Tiles
  },
  "3dtiles": {
    // Styling settings for the 3D Tiles
    color: "#f8f8ff", // Initial 3D Tiles color
    pbr: false, // Enable or disable Physically Based Rendering
  },
};

// Add the 3D Tiles layer to Re:Earth
const layerId = reearth.layers.add(sample3dTiles);

reearth.viewer.overrideProperty({
  // Enable Cesium World Terrain
  terrain: {
    enabled: true,
  },
  // Prevent buildings from floating above the terrain
  globe: {
    depthTestAgainstTerrain: true,
  },
});

// Move the camera to the specified position
reearth.camera.flyTo(
  {
    // Define the camera's target position
    heading: 4.427049010960799,
    height: 1182.6187185313975,
    lat: 35.66552094432892,
    lng: 139.77065176741144,
    pitch: -0.4754550303679297,
    roll: 0.00009119480271468916,
  },
  {
    // Define the duration of the camera movement (in seconds)
    duration: 2.0,
  }
);

reearth.extension.on("message", (msg) => {
  if (msg.action === "updateStylyCool") {
    reearth.layers.override(layerId, {
      "3dtiles": {
        show: true,
        pbr: false,
        color: {
          expression: {
            conditions: [
              ["\${_zmax} > 200", "color('#005f8d')"],
              ["\${_zmax} > 150", "color('#008cdd')"],
              ["\${_zmax} > 100", "color('#33baff')"],
              ["\${_zmax} > 50", "color('#7cd8ff')"],
              ["\${_zmax} > 0", "color('#d5f2ff')"],
              ["true", "color('#003f66')"],
            ],
          },
        },
      },
    });
  }
});

reearth.extension.on("message", (msg) => {
  if (msg.action === "updateStylyWarm") {
    reearth.layers.override(layerId, {
      "3dtiles": {
        show: true,
        pbr: false,
        color: {
          expression: {
            conditions: [
              ["\${_zmax} > 200", "color('#f5220f')"], 
              ["\${_zmax} > 150", "color('#ff5e47')"], 
              ["\${_zmax} > 100", "color('#ff9586')"],
              ["\${_zmax} > 50", "color('#ffc1b8')"],
              ["\${_zmax} > 0", "color('#ffe5e0')"], 
              ["true", "color('#a1140a')"],
            ],
          },
        },
      },
    });
  }
});
`
};

export const overrideStyle: PluginType = {
  id: "override-style",
  title: "Override Style",
  files: [widgetFile, yamlFile]
};
