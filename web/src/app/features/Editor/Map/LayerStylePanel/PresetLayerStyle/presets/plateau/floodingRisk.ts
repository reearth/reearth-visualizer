import { PresetStyle } from "../types";

export const plateauFloodingRisk: PresetStyle = {
  id: "plateauFloodingRisk",
  title: "Flooding Risk",
  testId: "preset-style-plateau-flooding-risk",
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
