import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "style-with-condition-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: style-with-condition-plugin
name: Style With Condition
version: 1.0.0
extensions:
  - id: style-with-condition
    type: widget
    name: Style With Condition
    description: Style With Condition
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "style-with-condition",
  title: "style-with-condition.js",
  sourceCode: `// This example shows how to style 3D model（gltf) //

// Define 3D model data
const model3D01 = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-85.38657958835984, 33.696966258616634],
      },
    },
  },
  model: {
    show: true,
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/gltf/animatedFox.gltf",
    heightReference: "clamp",
    minimumPixelSize: 100, // Sets the minimum visible size of the model
    maximumPixelSize: 1000, // Sets the maximum visible size of the model
    animation: true, // Enables animation of the 3D model if timeline is played
    shadows: "enabled", // There are four options: "disabled", "enabled", "cast_only", "receive_only"
    color: "#fffafa", // Defines a color for the model
  },
};

const model3D02 = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-85.38657958835984, 33.696266258616634],
      },
    },
  },
  model: {
    show: true, // Determines whether the 3D model is visible (default: true)
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/gltf/animatedFox.gltf",
    heightReference: "clamp", // Options: "none" | "clamp" | "relative"
    // scale: 10000, // Sets a fixed size. Zooming doesn't affect the model's size if used.
    minimumPixelSize: 100, // Sets the minimum visible size of the model
    maximumPixelSize: 1000, // Sets the maximum visible size of the model
    shadows: "enabled", // There are four options: "disabled", "enabled", "cast_only", "receive_only"
    pbr: false, // Enables or disables Physically Based Rendering
  },
};

// Add 3D models to the layer
reearth.layers.add(model3D01);
reearth.layers.add(model3D02);

// In this example, the time width is set to set the time for the shadow to appear
// Set the time range on the timeline
reearth.timeline.setTime({
  // Start time
  start: new Date("2023-12-01T09:00:00-06:00"),
  // End time
  stop: new Date("2023-12-01T15:00:00-06:00"),
  // Time to be set as the current timeline position
  current: new Date("2023-12-01T10:00:00-06:00"),
});

// To animate the 3D model, you need to play the timeline
reearth.timeline.play();

// Set the playback speed of the timeline (1 = normal speed)
reearth.timeline.setSpeed(1);

// Enable shadow settings in the Re:Earth viewer
reearth.viewer.overrideProperty({
  scene: {
    shadow: {
      enabled: true,
    },
  },
});

// Move the camera to a specified position
reearth.camera.flyTo(
  {
    // Defines the target camera position
    heading: 5.358457498291187,
    height: 274.0013699012735,
    lat: 33.69505063085045,
    lng: -85.38408270921741,
    pitch: -0.7236883292676297,
    roll: 0.00000479625186056154,
  },
  {
    // Duration of the camera movement in seconds
    duration: 2.0,
  }
);

// 3D Model Data: @AsoboStudio and @scurest (Licensed under CC BY 4.0)
`
};

export const styleWithCondition: PluginType = {
  id: "style-with-condition",
  title: "Style With Condition",
  files: [widgetFile, yamlFile]
};
