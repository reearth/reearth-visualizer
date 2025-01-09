import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-geojson-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: add-geojson-plugin
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

// Difine the Polygon with inline
const layerGeojsonInline = {
  type: "simple", // Must be written on first
  data: {
    type: "geojson", // Write the data format
    value: { // Ensure that "value" contains GeoJSON.
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

// Difine the Polygon with URL
const layerGeojsonFromUrl = {
  type: "simple",
  data: {
    type: "geojson", 
    url: "https://shogohirasawa.github.io/for_delivery/sample01.geojson", // URL to the GeoJSON file
  },
  polygon: {}, // Settings for the feature style.  
};

// Adding the inline GeoJSON layer to Re:Earth
reearth.layers.add(layerGeojsonInline);

// Adding the GeoJSON layer from the URL to Re:Earth
reearth.layers.add(layerGeojsonFromUrl);
`
};

export const addGeojson: PluginType = {
  id: "add-geojson",
  title: "Add GeoJSON",
  files: [widgetFile, yamlFile]
};
