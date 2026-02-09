import { PresetStyle } from "../types";

export const plateauHighTideRisk: PresetStyle = {
  id: "plateauHighTideRisk",
  title: "High Tide Risk",
  titleJa: "高潮浸水想定区域",
  testId: "preset-style-plateau-high-tide-risk",
  style: {
    "3dtiles": {
      pbr: "withTexture",
      color: {
        expression: "rgba(0, 190, 190, 0.5)"
      },
      show: {
        expression: {
          conditions: [["true", "true"]]
        }
      },
      shadows: "disabled",
      selectedFeatureColor: "#00bebe"
    }
  }
};
