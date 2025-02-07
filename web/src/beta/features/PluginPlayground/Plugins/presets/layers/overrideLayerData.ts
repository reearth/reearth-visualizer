import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "override-layer-data-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: override-layer-data-plugin
name: Override Layer Data
version: 1.0.0
extensions:
  - id: override-layer-data
    type: widget
    name: Override Layer Data
    description: Override Layer Data
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "override-layer-data",
  title: "override-layer-data.js",
  sourceCode: `// By clicking the button on the screen, the polygon's Geometory is overwritten and a new polygon is created //

// The following describes the style and functionality of the UI //
reearth.ui.show(\`
<style>
  #scaleBtn {
    padding: 8px;
    border-radius: 4px;
    border: none;
    background: #fffafa;
    color: #000000;
    cursor: pointer;
    width: 200px;
    height: 60px;
    font-size: 16px 
  }
  #scaleBtn:active {
  background: #dcdcdc;
  }
  
</style>
<button id="scaleBtn">Scale Polygon</button>

<script>
  // define initial polygon geometory
  let corners = [
    [-104.18583328622142, 45.40439609826688],
    [-65.64945367690679,  45.99933007244422],
    [-69.5510586832507,   26.483465303049478],
    [-99.39529141009926,  26.00853862085437],
    [-104.18583328622142, 45.40439609826688],
  ];

  // Send "corners" to Re:Earth（WebAssembly） for drawing
  parent.postMessage({
    action: "updatePolygon",
    payload: { corners },
  }, "*");
  
  // Press the button to enlarge the four corners of the polygon
  const btn = document.getElementById("scaleBtn");
  btn.addEventListener("click", () => {
    //Calculate the center of polygon (center of gravity)
    const { centerLng, centerLat } = getCenter(corners);

    // Increase polygon size by 1.05
    const scaleFactor = 1.05;
    corners = corners.map(([lng, lat]) => {
      const diffLng = lng - centerLng;
      const diffLat = lat - centerLat;
      return [
        centerLng + diffLng * scaleFactor,
        centerLat + diffLat * scaleFactor,
      ];
    });

    // Close the polygon with the tail in the same coordinates as the beginning
    corners[corners.length - 1] = corners[0];

    // Send created polygons to Re:Earth（WebAssembly）
    parent.postMessage({
      action: "updatePolygon",
      payload: { corners },
    }, "*");
  });

  // The function to calculate the center of gravity of a polygon 
  function getCenter(coords) {
    let sumLng = 0;
    let sumLat = 0;
    coords.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });
    const n = coords.length;
    return {
      centerLng: sumLng / n,
      centerLat: sumLat / n,
    };
  }
</script>
\`);

// The following describes the process on the Re:Earth (WebAssembly) side //

// Set polygons when initially displayed
const LayerManager = {
  _layerId: null,

  createInitialLayer() {
    // Check if polygon already exists
    if (this._layerId) return;

    // Add new layer
    this._layerId = reearth.layers.add({
      type: "simple",
      name: "Growing Polygon",
      data: {
        type: "geojson",
        value: {
          type: "FeatureCollection",
          features: [],
        },
      },
      polygon: {
        fillColor: "#f8f8ff80",
        stroke: true,
        strokeColor: "white",
        strokeWidth: 3,
      },
    });
  },

  // Polygon update using geometory received from UI side
  updatePolygon(corners) {
    this.createInitialLayer(); // Create initial layer if necessary

    // GeoJSON Feature
    const feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [corners], 
      },
      properties: {},
    };

    // Geometry update with override
    reearth.layers.override(this._layerId, {
      data: {
        type: "geojson",
        value: {
          type: "FeatureCollection",
          features: [feature],
        },
      },
    });
  },
};

// Call "LayerManager" in the event handler
reearth.extension.on("message", msg => {
  if (msg.action === "updatePolygon") {
    const corners = msg.payload?.corners;
    if (!corners || corners.length < 4) return;

    // Update polygon
    LayerManager.updatePolygon(corners);
  }
});

// Creating the initial polygon layer 
LayerManager.createInitialLayer();
`
};

export const overrideLayerData: PluginType = {
  id: "Override Layer Data",
  title: "Override Layer Data",
  files: [widgetFile, yamlFile]
};
