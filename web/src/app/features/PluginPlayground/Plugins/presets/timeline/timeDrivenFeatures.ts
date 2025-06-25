import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "time-driven-features-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: timeDrivenFeatures-plugin
name: Time Driven Features
version: 1.0.0
extensions:
  - id: timeDrivenFeatures
    type: widget
    name: Time Driven Features
    description: Time Driven Features
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "timeDrivenFeatures",
  title: "timeDrivenFeatures.js",
  sourceCode: `// This example shows how to make a feature change with time //

// Define CZML that has time series data
// Polygon height changes every 5 seconds
const czmlData = [
  {
    id: "document",
    name: "3D Polygon Example",
    version: "1.0",
    clock: {
      interval: "2024-12-24T01:00:00Z/2024-12-24T01:00:20Z", // Define time range
      currentTime: "2024-12-24T01:00:00Z", // Define current (start) time
      multiplier: 5, // Playback speed (5 means 20 seconds of real time = 4 seconds in the animation)
    },
  },
  {
    id: "samplePolygon001",
    name: "samplePolygon001",
    availability: "2024-12-24T01:00:00Z/2024-12-24T01:00:05Z", // Define the time the feature is displayed
    polygon: {
      positions: {
        cartographicDegrees: [
          // Define lon,lat,height of the bottom of the feature
          -95.19644404998762, 39.121855688403606, 0, -95.86066795468007,
          30.135315689161864, 0, -84.60676001423798, 29.013591974308632, 0,
          -82.7088322952643, 37.87660535441917, 0, -95.19644404998762,
          39.121855688403606, 0,
        ],
      },
      extrudedHeight: 100000, // Defines the height at which the polygon is extruded
    },
  },
  {
    id: "samplePolygon002",
    name: "samplePolygon002",
    availability: "2024-12-24T01:00:05Z/2024-12-24T01:00:10Z",
    polygon: {
      positions: {
        cartographicDegrees: [
          -95.19644404998762, 39.121855688403606, 0, -95.86066795468007,
          30.135315689161864, 0, -84.60676001423798, 29.013591974308632, 0,
          -82.7088322952643, 37.87660535441917, 0, -95.19644404998762,
          39.121855688403606, 0,
        ],
      },
      extrudedHeight: 200000,
    },
  },
  {
    id: "samplePolygon003",
    name: "samplePolygon003",
    availability: "2024-12-24T01:00:10Z/2024-12-24T01:00:15Z",
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
  {
    id: "samplePolygon004",
    name: "samplePolygon004",
    availability: "2024-12-24T01:00:15Z/2024-12-24T01:00:20Z",
    polygon: {
      positions: {
        cartographicDegrees: [
          -95.19644404998762, 39.121855688403606, 0, -95.86066795468007,
          30.135315689161864, 0, -84.60676001423798, 29.013591974308632, 0,
          -82.7088322952643, 37.87660535441917, 0, -95.19644404998762,
          39.121855688403606, 0,
        ],
      },
      extrudedHeight: 400000,
    },
  },
];

// Convert the CZML array to a JSON string, then encode it, and make a data URI
const czmlString = JSON.stringify(czmlData);
const encodedCzml =
  "data:text/plain;charset=UTF-8," + encodeURIComponent(czmlString);

// Define a layer using the encoded CZML
const layerCzmlEncoded = {
  type: "simple", // Required
  data: {
    type: "czml", // Data format
    url: encodedCzml, // Use the encoded CZML string as a data URI
  },
  // Write the features style
  polygon: {
    fillColor: "#7fffd480",
  },
};

// Add the encoded CZML layer to Re:Earth
// Documentation for Layers "add" method https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerCzmlEncoded);

// Play timeline
// Documentation for Timeline "play" method https://visualizer.developer.reearth.io/plugin-api/timeline/#play
reearth.timeline.play();

// Move the camera to the position where the CZML data is displayed
// Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  {
    heading: 5.672603993826703,
    height: 975442.3456206004,
    lat: 23.205784181888504,
    lng: -78.89068372906681,
    pitch: -0.63747059888472,
    roll: 0.0003915776610474708,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);`
};

export const timeDrivenFeatures: PluginType = {
  id: "time-driven-features",
  files: [yamlFile, widgetFile]
};
