import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-styled-geojson-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-styled-geojson-plugin
name: Add Styled Geojson
version: 1.0.0
extensions:
  - id: layers-add-styled-geojson
    type: widget
    name: Add Styled Geojson
    description: Add Styled Geojson
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-styled-geojson",
  title: "layers-add-styled-geojson.js",
  sourceCode: `// This example shows how to visualize a GeoJSON file with styles described.

// Define the GeoJSON inline
// The marker-symbol can be set by specifying the icon name in Cesium definition https://sandcastle.cesium.com/?src=GeoJSON%20simplestyle.html.

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        "marker-color": "#ffcdd2",
        "marker-size": "medium",
        "marker-symbol": "circle",
      },
      geometry: {
        coordinates: [-194.00622573443866, 20.399255181154913],
        type: "Point",
      },
      id: 0,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#e57373",
        "marker-size": "medium",
        "marker-symbol": "college",
      },
      geometry: {
        coordinates: [-188.17426823098538, 20.464318547964652],
        type: "Point",
      },
      id: 1,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#f44336",
        "marker-size": "medium",
        "marker-symbol": "alcohol-shop",
      },
      geometry: {
        coordinates: [177.08552896638088, 20.601752125976617],
        type: "Point",
      },
      id: 2,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#d34f2f",
        "marker-size": "medium",
        "marker-symbol": "airport",
      },
      geometry: {
        coordinates: [182.14702643863745, 20.55984463648697],
        type: "Point",
      },
      id: 3,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#8b0000",
        "marker-size": "medium",
        "marker-symbol": "airfield",
      },
      geometry: {
        coordinates: [187.3926281912387, 20.62356320783138],
        type: "Point",
      },
      id: 4,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#bbdefb",
        "marker-size": "medium",
        "marker-symbol": "star",
      },
      geometry: {
        coordinates: [166.01061498097795, 16.27621864599537],
        type: "Point",
      },
      id: 5,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#64b5f6",
        "marker-size": "medium",
        "marker-symbol": "pitch",
      },
      geometry: {
        coordinates: [171.764495187193, 16.40257483269754],
        type: "Point",
      },
      id: 6,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#2196f3",
        "marker-size": "medium",
        "marker-symbol": "rocket",
      },
      geometry: {
        coordinates: [176.8938282084406, 16.711978394792993],
        type: "Point",
      },
      id: 7,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#1976d2",
        "marker-size": "medium",
        "marker-symbol": "hospital",
      },
      geometry: {
        coordinates: [182.29517934725163, 16.988080835732546],
        type: "Point",
      },
      id: 8,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#0d47a1",
        "marker-size": "medium",
        "marker-symbol": "restaurant",
      },
      geometry: {
        coordinates: [187.45520678418632, 17.04404972771671],
        type: "Point",
      },
      id: 9,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#c8e6c9",
        "marker-size": "medium",
        "marker-symbol": "shop",
      },
      geometry: {
        coordinates: [165.67656544924068, 12.675646888166781],
        type: "Point",
      },
      id: 10,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#81c784",
        "marker-size": "medium",
        "marker-symbol": "post",
      },
      geometry: {
        coordinates: [171.51555515584477, 13.266629365808356],
        type: "Point",
      },
      id: 11,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#4caf50",
        "marker-size": "medium",
        "marker-symbol": "dam",
      },
      geometry: {
        coordinates: [176.68130200154417, 13.235362675460024],
        type: "Point",
      },
      id: 12,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#388e3c",
        "marker-size": "medium",
        "marker-symbol": "beer",
      },
      geometry: {
        coordinates: [182.28716134973826, 13.268454687399824],
        type: "Point",
      },
      id: 13,
    },
    {
      type: "Feature",
      properties: {
        "marker-color": "#1b5e20",
        "marker-size": "medium",
        "marker-symbol": "embassy",
      },
      geometry: {
        coordinates: [187.39540387740334, 13.097076355848102],
        type: "Point",
      },
      id: 14,
    },
  ],
};

// Encoding GeoJSON
const geojsonString = JSON.stringify(geojson);
const encodedGeojson =
  "data:text/plain;charset=UTF-8," + encodeURIComponent(geojsonString);

// Define the GeoJSON inline
const layerGeojsonInline = {
  type: "simple", // Required
  data: {
    type: "geojson", // Write the data format
    url: encodedGeojson,
    geojson: {
      useAsResource: true,
    },
  },
};

// Add the inline GeoJSON layer to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerGeojsonInline);

// Move camera position
reearth.camera.flyTo(
  {
    heading: 6.283185307179582,
    height: 5802601.156165971,
    lat: 16.12769834691952,
    lng: 175.81575081063477,
    pitch: -1.57050670528186,
    roll: 0,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);
`
};

export const addStyledGeojson: PluginType = {
  id: "add-styled-geojson",
  files: [yamlFile, widgetFile]
};