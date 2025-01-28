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
// Add point marker with styling
const pointLayer = reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [139.97422779688281, 35.74642872517698],
            type: "Point",
          },
        },
      ],
    },
  },
  marker: {
    style: "point",
    pointColor: "red",
    pointSize: 12,
    pointOutlineColor: "white",
    pointOutlineWidth: 1,
    height: 100,
    heightReference: "relative"
  }
});

// Add polyline with styling
const polylineLayer = reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [
              [139.93007825346956, 35.81332779614391],
              [139.8105822019014, 35.730789521095986],
            ],
            type: "LineString",
          },
        },
      ],
    },
  },
  polyline: {
    clampToGround: true,
    classificationType: "terrain",
    show: true,
    strokeColor: "red",
    strokeWidth: 3
  }
});

// Add polygon with styling
const polygonLayer = reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    value: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [
              [
                [139.56560369329821, 35.859787461762906],
                [139.56560369329821, 35.586320662892106],
                [139.73648312259508, 35.586320662892106],
                [139.73648312259508, 35.859787461762906],
                [139.56560369329821, 35.859787461762906],
              ],
            ],
            type: "Polygon",
          },
        },
      ],
    },
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
});

// Move camera to a position that shows all layers
reearth.camera.flyTo({
  lat: 35.7,
  lng: 139.75,
  height: 50000,
  heading: 0,
  pitch: -45,
  roll: 0
});`
};

export const geojsonStyling: PluginType = {
  id: "geojson-styling",
  title: "GeoJSON Styling",
  files: [widgetFile, yamlFile]
};
