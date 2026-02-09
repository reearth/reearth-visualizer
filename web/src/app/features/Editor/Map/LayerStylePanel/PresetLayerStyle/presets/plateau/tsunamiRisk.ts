import { PresetStyle } from "../types";

export const plateauTsunamiRisk: PresetStyle = {
  id: "plateauTsunamiRisk",
  title: "Tsunami Risk",
  titleJa: "津波浸水想定区域",
  testId: "preset-style-plateau-tsunami-risk",
  style: {
    "3dtiles": {
      pbr: "withTexture",
      color: "#00BEBE80",
      shadows: "disabled",
      selectedFeatureColor: "#00bebe"
    }
  }
};
