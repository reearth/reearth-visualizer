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

// Click the buttons to switch between different 3D Tiles color gradients

// Define the plug-in UI //
reearth.ui.show(\`
${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    .coolBtn {
      padding: 8px;
      border-radius: 4px;
      border: none;
      background: #f0ffff;
      color: #000000;
      cursor: pointer;
      width: 200px;
      height: 40px;
      font-size: 16px 
    }
    .scaleBtn:active {
      background: #dcdcdc;
    }
    .warmBtn {
      padding: 8px;
      border-radius: 4px;
      border: none;
      background:#ffe4e1;
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
      <button class = "coolBtn" id="cool">Cool Style</button>
      <button class = "warmBtn" id="warm">Warm Style</button>
    </div>
  </div>
  
  <script>
  const coolStyle = document.getElementById("cool");
  const warmStyle  = document.getElementById("warm");

  // Click a button to send a postMessage to Re:Earth(Web Assembly) side.
  coolStyle.addEventListener("click",() =>{
    parent.postMessage({
      action: "updateStyleCool",
    }, "*");
    })
  
  warmStyle.addEventListener("click",() =>{
    parent.postMessage({
      action: "updateStyleWarm",
    }, "*");
    })
  </script>
  \`);

// Define Re:Earth(Web Assembly) side //

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

// Listen for messages from the UI and override the style for "Cool Style or "Warm Style"
reearth.extension.on("message", (msg) => {
  const { action } = msg;
  if (action === "updateStyleCool") {
    reearth.layers.override(layerId, {
      "3dtiles": {
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
  } else if (action === "updateStyleWarm") {
    reearth.layers.override(layerId, {
      "3dtiles": {
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

// Set the timeline to a morning hour so that building colors are easy to see
reearth.timeline.setTime({
    start: new Date("2023-01-01T00:00:00Z"),
    stop: new Date("2023-01-01T10:00:00Z"),
    current: new Date("2023-01-01T02:00:00Z"),
  })`
};

export const overrideStyle: PluginType = {
  id: "override-style",
  title: "Override Feature Style",
  files: [widgetFile, yamlFile]
};
