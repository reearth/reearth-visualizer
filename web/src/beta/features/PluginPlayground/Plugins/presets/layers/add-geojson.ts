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
  sourceCode: `// Example of adding a layer with GeoJSON（Polygon,Polyline,Marker) data

// Define the GeoJSON inline
const nycAirportPoint = {
  type: "simple", // Required
  data: {
    type: "geojson", // Write the data format
    value: { // Ensure that "value" contains GeoJSON
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [-73.87355757907106, 40.77534208229679],
            type: "Point",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [-73.78432524270048, 40.64650562178011],
            type: "Point",
          },
        },
      ],
    },
  },
  // Settings for the feature style. This statement is required even if no style is set.
  marker: {
    "pointColor": "#ffa500",
    "pointSize": 5,
    "style": "point"
  }
};

// Define the GeoJSON with URL
const nycAirportArea = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/nyc_airport_polygon.geojson",
  },
  polygon: {
    "fillColor": "#ffffff80",
    "stroke": true,
    "strokeColor": "#ffa500",
    "strokeWidth": 2
  }
};

const nycRoadPrimary = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/nyc-road-primary.geojson",
  },
  // Settings for the feature style. This statement is required even if no style is set.
   polyline: {}
};

// Add the inline GeoJSON layer to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add

reearth.layers.add(nycAirportPoint);

// Add the GeoJSON layer from the URL to Re:Earth
reearth.layers.add(nycAirportArea);
reearth.layers.add(nycRoadPrimary);

// Move camera position
reearth.camera.flyTo(
  {
    heading: 6.074459786948563,
    height: 53215.9926669169,
    lat: 40.64351884997972,
    lng: -73.93193384749776,
    pitch: -1.447791863773106,
    roll: 6.283138405962417,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);`
};

export const addGeojson: PluginType = {
  id: "add-geojson",
  files: [yamlFile, widgetFile]
};
