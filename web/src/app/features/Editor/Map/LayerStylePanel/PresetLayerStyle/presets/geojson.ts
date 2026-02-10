import { PresetStyle, PresetStyleCategory } from "./types";

const geojsonSimpleStyle: PresetStyle = {
  id: "geojsonSimple",
  title: "GeoJSON Simple",
  testId: "preset-style-geojson-simple",
  style: {
    marker: {
      pointColor: {
        expression: "${marker-color}"
      },
      pointOutlineColor: {
        expression: "${marker-color}"
      },
      pointSize: {
        expression: {
          conditions: [
            ["${marker-size}==='small'", "8"],
            ["${marker-size}==='medium'", "12"],
            ["${marker-size}==='large'", "16"]
          ]
        }
      },
      style: "point"
    },
    polygon: {
      fillColor: {
        expression: "color(${fill},${fill-opacity})"
      },
      heightReference: "clamp",
      stroke: true,
      strokeColor: {
        expression: "${stroke}"
      },
      strokeWidth: {
        expression: "${stroke-width}"
      }
    },
    polyline: {
      clampToGround: true,
      strokeColor: {
        expression: "color(${stroke},${stroke-opacity})"
      },
      strokeWidth: {
        expression: "${stroke-width}"
      }
    }
  }
};

export const geojsonPresets: PresetStyleCategory = {
  id: "geojson",
  title: "GeoJSON",
  testId: "preset-style-geojson",
  subs: [geojsonSimpleStyle]
};
