import { SketchAppearance } from "./types";

export const PRESET_APPEARANCE: SketchAppearance = {
  marker: {
    height: 0,
    heightReference: "clamp",
    hideIndicator: true,
    selectedFeatureColor: "#00bebe",
  },
  polygon: {
    classificationType: "terrain",
    extrudedHeight: {
      expression: "${extrudedHeight}",
    },
    fillColor: "#FFFFFF",
    heightReference: "clamp",
    hideIndicator: true,
    selectedFeatureColor: "#00bebe",
    shadows: "enabled",
  },
  polyline: {
    clampToGround: true,
    hideIndicator: true,
    selectedFeatureColor: "#00bebe",
    shadows: "enabled",
    strokeColor: "#FFFFFF",
    strokeWidth: 2,
  },
};
