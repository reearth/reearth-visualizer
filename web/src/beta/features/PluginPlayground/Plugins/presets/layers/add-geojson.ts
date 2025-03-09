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
const layerGeojsonInline = { 
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
            type: "Polygon",
            coordinates: [
              [
                [-97.52842673316115, 28.604966534790364],
                [-97.52842673316115, 10.990084521105842],
                [-82.13620852840572, 10.990084521105842],
                [-82.13620852840572, 28.604966534790364],
                [-97.52842673316115, 28.604966534790364],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [
              [-96.37001899616324, 41.04652707558762],
              [-79.17331346249145, 40.45826161216959],
            ],
            type: "LineString",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [-111.99963039093615, 19.881084591317787],
            type: "Point",
          },
        },
      ],
    },
  },
  // Settings for the feature style. This statement is required even if no style is set.
  polygon: {},
  polyline: {},
  marker: {},
};

// Define the GeoJSON with URL
const layerGeojsonFromUrl = {
  type: "simple",
  data: {
    type: "geojson",
    // URL of GeoJSON file
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/sample_polygon_polyline_marker.geojson",
  },
  polygon: {
    fillColor: 'red'
  },
  polyline: {
    strokeColor: 'red'
  },
  marker: {
    imageColor: 'red'
  },
};

// Add the inline GeoJSON layer to Re:Earth
reearth.layers.add(layerGeojsonInline);

// Add the GeoJSON layer from the URL to Re:Earth
reearth.layers.add(layerGeojsonFromUrl);
`
};

export const addGeojson: PluginType = {
  id: "add-geojson",
  files: [widgetFile, yamlFile],
  title: "Add GeoJSON"
};
