import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-geojson",
  title: "reearth.yml",
  sourceCode: `id: layers-add-geojson
name: Add GeoJSON
version: 1.0.0
extensions:
  - id: add geojson
    type: widget
    name: Add Geojson
    description: Add Geojson
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-geojson",
  title: "layers-add-geojson.js",
  sourceCode: `// Example of adding a layer with GeoJSON data

// Difine the polygon with inline
const layerPolygonInline = {
  id:"feature001", // A unique identifier for the layer
  type: "simple", // Must be written
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
      ],
    },
  },
  polygon: {}, // Settings for the feature style. This statement is required even if no style is set.
};

// Difine the polygon with URL
const layerPolygonFromUrl = {
  id:"feature002",
  type: "simple",
  data: {
    type: "geojson", 
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/square.geojson", // URL of GeoJSON file
  },
  polygon: {},
};

const layerPolylineInline = {
  id:"feature003", 
  type: "simple", 
  data: {
    type: "geojson",
    value: {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          [
            -96.37001899616324,
            41.04652707558762
          ],
          [
            -79.17331346249145,
            40.45826161216959
          ]
        ],
        "type": "LineString"
      }
    }
  ]
}
  },
  polyline: {},
};


// Add the inline polygon layer to Re:Earth
reearth.layers.add(layerPolygonInline);

// Add the polygon layer from the URL to Re:Earth
reearth.layers.add(layerPolygonFromUrl);

// Add the polyline layer from the URL to Re:Earth
reearth.layers.add(layerPolylineInline);
`
};

export const addGeojson: PluginType = {
  id: "add-geojson",
  title: "Add GeoJSON",
  files: [widgetFile, yamlFile]
};
