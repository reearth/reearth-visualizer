import { PresetStyle } from "../types";

export const plateauHighTideRisk: PresetStyle = {
  id: "plateauHighTideRisk",
  title: "High Tide Risk",
  titleJa: "高潮浸水想定区域",
  testId: "preset-style-plateau-high-tide-risk",
  style: {
    "3dtiles": {
      pbr: "withTexture",
      color: "#00BEBE80",
      shadows: "disabled",
      selectedFeatureColor: "#00bebe"
    }
  }
};
