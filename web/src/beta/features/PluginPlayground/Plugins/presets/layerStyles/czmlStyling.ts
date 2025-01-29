import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "czml-styling-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: czml-styling-plugin
name: CZML Styling Examples
version: 1.0.0
extensions:
  - id: czml-styling
    type: widget
    name: CZML Styling
    description: Examples of czml features with different styling options
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "czml-styling",
  title: "czml-styling.js",
  sourceCode: `
  //Define CZML data with all three types
    const czmlData = [
      {
        id: "document",
        name: "CZML Styling Examples",
        version: "1.0"
      },
      {
        // Point/Marker with height
        id: "point1",
        position: {
          cartographicDegrees: [30, 0, 100000]  // Added height
        },
        point: {
          color: {
            rgba: [255, 0, 0, 255]
          },
          pixelSize: 15,
          outlineColor: {
            rgba: [255, 255, 255, 255]
          },
          outlineWidth: 2
        }
      },
      {
        // Polyline with varying height
        id: "polyline1",
        polyline: {
          positions: {
            cartographicDegrees: [
              31, 0, 50000,
              32, 0, 150000,
              33, 0, 50000
            ]
          },
          width: 3,
          material: {
            solidColor: {
              color: {
                rgba: [0, 0, 255, 255]
              }
            }
          }
        }
      },
      {
        // Polygon with extrusion
        id: "polygon1",
        polygon: {
          positions: {
            cartographicDegrees: [
              34, 0, 0,
              35, 0, 0,
              35, 1, 0,
              34, 1, 0,
              34, 0, 0
            ]
          },
          material: {
            solidColor: {
              color: {
                rgba: [0, 255, 0, 200]  // Added some transparency
              }
            }
          },
          extrudedHeight: 200000  // Added extrusion
        }
      }
    ];

    // Convert to encoded URL
    const czmlString = JSON.stringify(czmlData);
    const encodedCzml = "data:text/plain;charset=UTF-8," + encodeURIComponent(czmlString);

    // Define layer
    const czmlLayer = {
      type: "simple",
      data: {
        type: "czml",
        url: encodedCzml
      }
    };

    // Add layer and fly to view
    const layerId = reearth.layers.add(czmlLayer);

    reearth.camera.flyTo({
      lng: 32.5,
      lat: 0.5,
      height: 850000,
      heading: 0,
      roll: 0
    }, {
      duration: 2.0
  });`
};

export const czmlStyling: PluginType = {
  id: "czml-styling",
  title: "CZML Styling",
  files: [widgetFile, yamlFile]
};
