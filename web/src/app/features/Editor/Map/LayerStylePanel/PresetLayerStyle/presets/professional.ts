import { PresetStyle } from "./types";

export const professionalStyle: PresetStyle = {
  id: "professional",
  title: "Professional",
  testId: "preset-style-professional",
  style: {
    marker: {
      heightReference: "clamp",
      hideIndicator: true,
      pointColor: "#E9373D",
      pointOutlineColor: "white",
      pointOutlineWidth: 1,
      pointSize: 12,
      selectedFeatureColor: "#F1AF02",
      style: "point"
    },
    polygon: {
      extrudedHeight: {
        expression: "${extrudedHeight}"
      },
      fillColor: {
        expression: "color('#E9373D',0.6)"
      },
      heightReference: "clamp",
      hideIndicator: true,
      selectedFeatureColor: {
        expression: "color('#F1AF02',0.6)"
      }
    },
    polyline: {
      clampToGround: true,
      hideIndicator: true,
      selectedFeatureColor: "#F1AF02",
      strokeColor: "#E9373D",
      strokeWidth: 2
    }
  }
};
