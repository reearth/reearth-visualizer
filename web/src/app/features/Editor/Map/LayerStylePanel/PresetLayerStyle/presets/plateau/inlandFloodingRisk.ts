import { PresetStyle } from "../types";

export const plateauInlandFloodingRisk: PresetStyle = {
  id: "plateauInlandFloodingRisk",
  title: "Inland Flooding Risk",
  titleJa: "内水浸水想定区域",
  testId: "preset-style-plateau-inland-flooding-risk",
  style: {
    "3dtiles": {
      pbr: "withTexture",
      color: "#00BEBE80",
      shadows: "disabled",
      selectedFeatureColor: "#00bebe"
    }
  }
};
