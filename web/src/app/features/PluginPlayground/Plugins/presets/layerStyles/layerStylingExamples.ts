import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layer-styling-examples-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layer-styling-examples-plugin
name: Layer Styling Examples
version: 1.0.0
extensions:
  - id: layer-styling-examples
    type: widget
    name: Layer Styling Examples
    description: Examples of styling different layer formats (GeoJSON, CZML, KML)
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layer-styling-examples",
  title: "layer-styling-examples.js",
  sourceCode: `
  // This example demonstrates styling different layer formats in Re:Earth.
  // It shows how to apply various styles (marker, polyline, polygon) to:
  // - GeoJSON (West): Point marker, polyline, and polygon features
  // - CZML (Center): Point marker, polyline, and polygon features
  // - KML (East): Point marker, polyline, and polygon features
  // - CSV (Far East): Point marker feature
  // The styling format remains consistent across all layer types, showing that the same styling properties can be applied regardless of the data format.
  // All features are positioned to be visible simultaneously on the map
  // without overlap, aligned from west to east.


  // ==================================
  // GeoJSON Layer (West Area)
  // ==================================
    const geojsonLayer = {
      type: "simple",
      data: {
        type: "geojson",
        url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/geojson_styling_data.geojson",
    },
      marker: {
        style: "point",
        pointColor: "#FF4444",
        pointSize: 15,
        pointOutlineColor: "white",
        pointOutlineWidth: 2
      },
      polyline: {
        strokeColor: "#4444FF",
        strokeWidth: 4,
        clampToGround: true
      },
      polygon: {
        fillColor: "rgba(255, 0, 0, 0.3)",
        stroke: true,
        strokeColor: "#FF0000",
        strokeWidth: 3
      }
    };

  // ==================================
  // CZML Layer (Central Area)
  // ==================================
  const czmlLayer = {
    type: "simple",
    data: {
      type: "czml",
      url: "https://reearth.github.io/visualizer-plugin-sample-data/public/czml/czml_styling_data.czml",
    },
    marker: {
      style: "point",
      pointColor: "#44FF44",
      pointSize: 15,
      pointOutlineColor: "white",
      pointOutlineWidth: 2
    },
    polyline: {
      strokeColor: "#FF44FF",
      strokeWidth: 4
    },
    polygon: {
      fillColor: "rgba(0, 255, 0, 0.3)",
      stroke: true,
      strokeColor: "#00FF00",
      strokeWidth: 3
    }
  };

  // ==================================
  // KML Layer (East Area)
  // ==================================
  const kmlLayer = {
    type: "simple",
    data: {
      type: "kml",
      url: "https://reearth.github.io/visualizer-plugin-sample-data/public/kml/kml_styling_data.kml",
    },
    marker: {
      pointColor: "#4444FF",
      pointSize: 15,
      pointOutlineColor: "white",
      pointOutlineWidth: 2
    },
    polyline: {
      strokeColor: "#FFFF44",
      strokeWidth: 4,
      clampToGround: true
    },
    polygon: {
      fillColor: "rgba(0, 0, 255, 0.3)",
      stroke: true,
      strokeColor: "#0000FF",
      strokeWidth: 3
    }
  };

  // ==================================
  // CSV Layer (Aligned with other markers)
  // ==================================
  const csvLayer = {
    type: "simple",
    data: {
      type: "csv",
      url: "https://reearth.github.io/visualizer-plugin-sample-data/public/csv/csv_styling_data.csv",
      csv: {
        latColumn: "latitude",
        lngColumn: "longitude",
        heightColumn: "height"
      }
    },
    marker: {
      style: "point",
      pointColor: "#FF8800",
      pointSize: 15,
      pointOutlineColor: "white",
      pointOutlineWidth: 2
    }
  };

  // Add all layers
  // Documentation for Layers "add" method https://visualizer.developer.reearth.io/plugin-api/layers/#add
  reearth.layers.add(geojsonLayer);
  reearth.layers.add(czmlLayer);
  reearth.layers.add(kmlLayer);
  reearth.layers.add(csvLayer);

  // Position camera to view all features
  // Documentation for Camera "flyTo" method https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
  reearth.camera.flyTo({
    lng: 139.750,  // Center position to align all features
    lat: 35.7609591,   // Adjusted for better view of all features
    height: 40000,     // Increased height to see all features clearly
    heading: 0,
    pitch: -1.55,
    roll: 0
  });`
};

export const layerStylingExamples: PluginType = {
  id: "layer-styling-examples",
  files: [yamlFile, widgetFile]
};
