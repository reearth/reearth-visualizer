import { PresetStyle } from "../types";

export const plateauInlandFloodingRisk: PresetStyle = {
  id: "plateauInlandFloodingRisk",
  title: "Inland Flooding Risk",
  titleJa: "内水浸水想定区域",
  testId: "preset-style-plateau-inland-flooding-risk",
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
