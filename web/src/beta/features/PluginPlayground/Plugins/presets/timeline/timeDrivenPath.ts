import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "timeDrivenPath-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: timeDrivenPath-plugin
name: Time Driven Path
version: 1.0.0
extensions:
  - id: timeDrivenPath
    type: widget
    name: Time Driven Path
    description: Time Driven Path
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "timeDrivenPath",
  title: "timeDrivenPath.js",
  sourceCode: ` // This example shows how to move a 3D model linearly along time

// Define the CZML data that includes time series information
const czmlData = [
  {
    id: "document",
    name: "Tokaido Shinkansen Animation",
    version: "1.0",
    clock: {
      interval: "2024-02-12T06:00:00Z/2024-02-12T08:22:00Z",  // Define time range(start and end time)
      currentTime: "2024-02-12T06:00:00Z", // The initial time
      multiplier: 600, // Playback speed (600 means 10 minutes of real time = 1 minute in the animation)
      range: "LOOP_STOP", // This will loop the animation until it stops
    },
  },
  {
    id: "toukaido",
    name: "toukaido-shinkansen-root",
    availability: "2024-02-12T06:00:00Z/2024-02-12T08:22:00Z", // Availability time range for the train
    position: {
      epoch: "2024-02-12T06:00:00Z", // Starting point for the position (time)
      cartographicDegrees: [
        // Define the time, longitude, latitude, and height (altitude) for each time point
        // Time, lon, lat, height (in the order: time, lon, lat, height)
        0, 139.766084, 35.681382, 0, 532.5, 139.73868, 35.62847, 0, 1065,
        139.617572, 35.465031, 0, 1597.5, 139.159921, 35.254122, 0, 2130,
        139.071773, 35.115197, 0, 2662.5, 138.965717, 35.126885, 0, 3195,
        138.622902, 35.144373, 0, 3727.5, 138.383054, 34.975357, 0, 4260,
        137.997, 34.770556, 0, 4792.5, 137.734958, 34.702523, 0, 5325,
        137.391372, 34.769233, 0, 5857.5, 137.061397, 34.963855, 0, 6390,
        136.884094, 35.170417, 0, 6922.5, 136.756847, 35.302581, 0, 7455,
        136.292578, 35.315653, 0, 7987.5, 135.757784, 35.013298, 0, 8520,
        135.49056, 34.730327, 0,
      ],
    },
    // Define how the path will be displayed (the line showing the train's movement)
    path: {
      material: {
        solidColor: {
          color: {
            rgba: [255, 255, 255, 255],
          },
        },
      },
      width: 5,
      leadTime: 0,
    },

    // Define the 3D model
    model: {
      gltf: "https://reearth.github.io/visualizer-plugin-sample-data/public/gltf/train.gltf", // URL of 3D model（gltf)
      scale: 1.0, // Scale of the 3D model
      minimumPixelSize: 70, // Minimum pixel size of the model for visibility
    },
    orientation: {
    "velocityReference": "toukaido#position" // Set the 3D model to face the direction of travel based on the position
  }
  },
];

// Convert the CZML array to a JSON string, then encode it, and make a data URI
const czmlString = JSON.stringify(czmlData);
const encodedCzml =
  "data:text/plain;charset=UTF-8," + encodeURIComponent(czmlString);

// Define a layer using the encoded CZML
const layerCzmlEncoded = {
  type: "simple",
  data: {
    type: "czml",
    url: encodedCzml,
  },
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
    heading: 6.246954319760702,
    height: 591887.4618586897,
    lat: 29.62255491782384,
    lng: 137.32567845678386,
    pitch: -0.8072976015234672,
    roll: 0.0006403173192017775,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

// * Data License * //
// Line data: uedayou(https://uedayou.net/jrslod/)
`
};

export const timeDrivenPath: PluginType = {
  id: "time-driven-path",
  files: [yamlFile, widgetFile]
};
