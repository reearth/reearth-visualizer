import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "czml-styling-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: czml-styling-plugin
name: CZML Styling Examples
version: 1.0.0
extensions:
  - id: czml-styling
    type: widget
    name: CZML Styling
    description: Examples of czml features with different styling options
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "czml-styling",
  title: "czml-styling.js",
  sourceCode: `
  // Define the CZML array
const czmlData = [
  {
    id: "document",
    name: "CZML Layer with Marker, Polygon, and Polyline",
    version: "1.0",
  },
  // Polygon Feature
  {
    id: "polygon",
    name: "Polygon Feature",
    polygon: {
      positions: {
        cartographicDegrees: [
          -110.0, 40.0, 0,
          -110.5, 35.0, 0,
          -100.5, 35.0, 0,
          -100.0, 40.0, 0,
          -110.0, 40.0, 0
        ],
      },
      extrudedHeight: 300000,
    },
  },
  // Polyline Feature
  {
    id: "polyline",
    name: "Polyline Feature",
    polyline: {
      positions: {
        cartographicDegrees: [
          -95.0, 33.0, 0,
          -85.0, 30.0, 0,
        ],
      },
      width: 5,
    },
  },
  // Marker Feature
  {
    id: "marker",
    name: "Marker Feature",
    position: {
      cartographicDegrees: [-80.0, 28.0, 100], // Adjusted longitude and latitude
    },
    point: {}
  },
];

// Convert the CZML array to a JSON string, then encode it, and make a data URI
const czmlString = JSON.stringify(czmlData);
const encodedCzml = "data:text/plain;charset=UTF-8," + encodeURIComponent(czmlString);

// Define the CZML layer with styling applied via layer properties
const layerCzmlEncoded = {
  type: "simple",
  data: {
    type: "czml",
    url: encodedCzml,
  },
  // Apply styling through layer properties
  marker: {
    style: "point",
    show: true,
    pointColor: "red",
    pointSize: 12,
    pointOutlineColor: "white",
    pointOutlineWidth: 1,
    height: 100,
    heightReference: "relative",
  },
  polyline: {
    strokeColor: "blue",
    strokeWidth: 5,
    clampToGround: true,
  },
  polygon: {
    fillColor: {
      expression: "color('#ed0297',0.5)",
    },
    show: true,
    stroke: true,
    strokeColor: "blue",
    strokeWidth: 3,
  },
};

// Add the CZML layer to Re:Earth
reearth.layers.add(layerCzmlEncoded);

// Adjust camera dynamically to ensure all features are visible
reearth.camera.flyTo(
  {
    lng: -95.0,
    lat: 34.0,
    height: 3000000,
    heading: 5.949278757227463,
    pitch: -1.45,
    roll: 0,
  },
  {
    duration: 1.5,
  });`
};

export const czmlStyling: PluginType = {
  id: "czml-styling",
  title: "CZML Styling",
  files: [widgetFile, yamlFile]
};
