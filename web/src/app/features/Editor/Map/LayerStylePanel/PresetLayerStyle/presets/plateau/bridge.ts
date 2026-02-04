import { PresetStyle } from "../types";

export const plateauBridge: PresetStyle = {
  id: "plateauBridge",
  title: "Bridge",
  testId: "preset-style-plateau-bridge",
  style: {
    "3dtiles": {
      selectedFeatureColor: "#00bebe",
      color: {
        expression: {
          conditions: [["true", 'color("#ffffff", 1)']]
        }
      }
    }
  }
};
