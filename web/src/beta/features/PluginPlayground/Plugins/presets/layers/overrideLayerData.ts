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
  sourceCode: `// This example shows how to override layer data
// Click on the marker to change the style

// Define marker layer
const sampleMarker01 = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-114.323082461786, 45.65050642694848],
          },
          properties: {},
        },
      ],
    },
  },
  marker: {
    style: "point",
    pointColor: "white",
    pointSize: 30,
  },
};

const sampleMarker02 = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-67.897037781222, 46.383155696276575],
          },
          properties: {},
        },
      ],
    },
  },
  marker: {
    style: "point",
    pointColor: "white",
    pointSize: 30,
  },
};

const sampleMarker03 = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-89.91300008413543, 18.53602119230712],
          },
          properties: {},
        },
      ],
    },
  },
  marker: {
    style: "point",
    pointColor: "white",
    pointSize: 30,
  },
};

// Add the marker defined above to the layer
reearth.layers.add(sampleMarker01);
reearth.layers.add(sampleMarker02);
reearth.layers.add(sampleMarker03);

// Get the layer ID of the marker user clicked on and override the style
reearth.layers.on("select", () => {
  const selectedLayerId = reearth.layers.selected.id;
  // Define the layer ID and the property to be changed as arguments
  reearth.layers.override(selectedLayerId, {
    marker: {
      image:
        "https://reearth.github.io/visualizer-plugin-sample-data/public/image/visualizer_logo.png",
      style: "image",
    },
  });
});`
};

export const overrideLayerData: PluginType = {
  id: "Override Layer Data",
  title: "Override Layer Data",
  files: [widgetFile, yamlFile]
};
