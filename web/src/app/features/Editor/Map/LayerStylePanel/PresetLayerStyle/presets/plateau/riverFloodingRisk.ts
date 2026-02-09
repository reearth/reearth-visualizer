import { PresetStyle } from "../types";

export const plateauRiverFloodingRisk: PresetStyle = {
  id: "plateauRiverFloodingRisk",
  title: "River Flooding Risk",
  titleJa: "洪水浸水想定区域",
  testId: "preset-style-plateau-river-flooding-risk",
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
