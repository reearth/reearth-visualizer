import { PresetStyle } from "./types";

export const defaultStyle: PresetStyle = {
  id: "default",
  title: "Default",
  testId: "preset-style-default",
  style: {
    marker: {
      heightReference: "clamp"
    },
    polygon: {
      extrudedHeight: {
        expression: "${extrudedHeight}"
      },
      fillColor: {
        expression: "color('#ffffff',0.8)"
      },
      heightReference: "clamp"
    },
    polyline: {
      clampToGround: true,
      strokeColor: "#FFFFFF",
      strokeWidth: 2
    },
    "3dtiles": {
      color: "#FFFFFF",
      colorBlendMode: "highlight"
    }
  }
};
