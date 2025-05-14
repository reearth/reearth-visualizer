import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-geojson-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-geojson-plugin
name: Add GeoJSON
version: 1.0.0
extensions:
  - id: layers-add-geojson
    type: widget
    name: Add Geojson
    description: Add Geojson
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-geojson",
  title: "layers-add-geojson.js",
  sourceCode: `// Example of adding a layer with GeoJSON data

// Define the GeoJSON inline
const parking = {
  type: "simple", // Required
  data: {
    type: "geojson", // Write the data format
    value: {
      // Ensure that "value" contains GeoJSON
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.6801173467784, 35.664320051880225],
            type: "Point",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.68096498886888, 35.66422614308836],
            type: "Point",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.6804930063421, 35.6646252546914],
            type: "Point",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.67922154320564, 35.66688684942308],
            type: "Point",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.67630295737206, 35.66621385561031],
            type: "Point",
          },
        },
      ],
    },
  },
  // Settings for the feature style. This statement is required even if no style is set.
  // Documentation on feature style: https://visualizer.developer.reearth.io/plugin-api/layers/#layer-appearance-types
  marker: {
    image:
      "https://reearth.github.io/visualizer-plugin-sample-data/public/image/parking.svg",
    imageSize: 0.15,
  },
};

// Define the GeoJSON with URL
const buildings = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/buildings_sample.geojson",
  },
  polygon: {
    fillColor: "#dcdcdc",
  },
};

const road = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/road_sample.geojson",
  },
  polyline: {
    strokeColor: "#f5f5f5",
    strokeWidth: 2,
  },
};

// Add the inline GeoJSON layer to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(parking);
reearth.layers.add(buildings);
reearth.layers.add(road);

// Move camera position
reearth.camera.flyTo(
  {
    heading: 0.009823371835937067,
    height: 1058.7119398361438,
    lat: 35.65662797724089,
    lng: 139.67962458714757,
    pitch: -0.8118880670484745,
    roll: 0.000004443281002686206,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

data: © OpenStreetMap
`
};

export const addGeojson: PluginType = {
  id: "add-geojson",
  files: [yamlFile, widgetFile]
};
