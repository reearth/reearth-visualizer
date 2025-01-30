import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "geojson-styling-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: geojson-styling-plugin
name: GeoJSON Styling Examples
version: 1.0.0
extensions:
  - id: geojson-styling
    type: widget
    name: GeoJSON Styling
    description: Examples of GeoJSON features with different styling options
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "geojson-styling",
  title: "geojson-styling.js",
  sourceCode: `
// Define GeoJSON layer with all feature types and their styles
const geoJSONLayer = {
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        // Polygon feature
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[
              [139.56560369329821, 35.859787461762906],
              [139.56560369329821, 35.586320662892106],
              [139.73648312259508, 35.586320662892106],
              [139.73648312259508, 35.859787461762906],
              [139.56560369329821, 35.859787461762906]
            ]]
          }
        },
        // Polyline feature
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [139.93007825346956, 35.81332779614391],
              [139.8105822019014, 35.730789521095986]
            ]
          }
        },
        // Point feature
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [139.97422779688281, 35.74642872517698]
          }
        }
      ]
    }
  },
  // Styles for each geometry type
  marker: {
    style: "point",
    pointColor: "red",
    pointSize: 12,
    pointOutlineColor: "white",
    pointOutlineWidth: 1,
    height: 100,
    heightReference: "relative"
  },
  polyline: {
    clampToGround: true,
    classificationType: "terrain",
    show: true,
    strokeColor: "red",
    strokeWidth: 3
  },
  polygon: {
    clampToGround: true,
    classificationType: "terrain",
    fill: true,
    fillColor: {
      expression: "color('#ed0297',0.5)"
    },
    show: true,
    stroke: true,
    strokeColor: "blue",
    strokeWidth: 3
  }
};

// Add layer and fly to view
const layerId = reearth.layers.add(geoJSONLayer);

reearth.camera.flyTo({
  lat: 35.7,
  lng: 139.75,
  height: 60000,
  heading: 0,
  roll: 0
});`
};

export const geojsonStyling: PluginType = {
  id: "geojson-styling",
  title: "GeoJSON Styling",
  files: [widgetFile, yamlFile]
};
