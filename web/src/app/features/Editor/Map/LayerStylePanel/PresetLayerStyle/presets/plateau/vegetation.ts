import { PresetStyle } from "../types";

export const plateauVegetation: PresetStyle = {
  id: "plateauVegetation",
  title: "Vegetation",
  testId: "preset-style-plateau-vegetation",
  style: {
    "3dtiles": {
      selectedFeatureColor: "#00bebe",
      pbr: false,
      color: {
        expression: {
          conditions: [
            ['${植生} !== "aaa"', 'color("#24C91D", 1)'],
            ["true", 'color("#ffffff", 1)']
          ]
        }
      }
    }
  }
};
