import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-czml-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-czml-plugin
name: Add CZML
version: 1.0.0
extensions:
  - id: layers-add-czml
    type: widget
    name: Add CZML
    description: Add CZML
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-czml",
  title: "layers-add-czml.js",
  sourceCode: `// Example of adding a layer with CZML data

// Define the CZML array
const czmlData = [
  {
    id: "document",
    name: "3D Polygon Example",
    version: "1.0",
  },
  {
    id: "polygon",
    name: "Polygon Example",
    polygon: {
      positions: {
        cartographicDegrees: [
          -95.19644404998762, 39.121855688403606, 0, -95.86066795468007,
          30.135315689161864, 0, -84.60676001423798, 29.013591974308632, 0,
          -82.7088322952643, 37.87660535441917, 0, -95.19644404998762,
          39.121855688403606, 0,
        ],
      },
      extrudedHeight: 300000,
    },
  },
];

// Convert the CZML array to a JSON string, then encode it, and make a data URI
const czmlString = JSON.stringify(czmlData);
const encodedCzml = "data:text/plain;charset=UTF-8," + encodeURIComponent(czmlString);

// Define a layer using the encoded CZML
const layerCzmlEncoded = {
  type: "simple", // Required
  data: {
    type: "czml", // Data format
    url: encodedCzml, // Use the encoded CZML string as a data URI
  },
  // Write the features style
  polygon: {
    fillColor: "red",
  },
};

// Define a layer using the CZML from an external URL
const layerCzmlUrl = {
  type: "simple",
  data: {
    type: "czml",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/czml/square_3d_polygon.czml", // URL of CZML file
  },
};

// Add the encoded CZML layer to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerCzmlEncoded);

// Add the CZML layer from the URL to Re:Earth
reearth.layers.add(layerCzmlUrl);

// Move the camera to the position where the CZML data is displayed
// Documentation on Camera "flyTo" event: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  {
    lng: -88.93602871895675,
    lat: 15.453904059215354,
    height: 2479417.0253900583,
    heading: 5.949278757227463,
    pitch: -0.8795938234403176,
    roll: 0.0004975556834603267,
  },
  {
    duration: 2.0, // Define camera movement time
  }
);
`
};

export const addCzml: PluginType = {
  id: "add-czml",
  files: [yamlFile, widgetFile]
};
