import { PresetStyle } from "../types";

export const plateauArea: PresetStyle = {
  id: "plateauArea",
  title: "Area",
  testId: "preset-style-plateau-area",
  style: {
    polygon: {
      fillColor: {
        expression: {
          conditions: [
            ['${urf_function} !== "a"', 'color("#BEEBAC", 1)'],
            ["true", 'color("#ffffff", 1)']
          ]
        }
      },
      strokeColor: {
        expression: {
          conditions: [["true", 'color("#ffffff", 0)']]
        }
      },
      stroke: false
    },
    polyline: {
      strokeColor: {
        expression: {
          conditions: [["true", 'color("#ffffff", 1)']]
        }
      }
    }
  }
};
