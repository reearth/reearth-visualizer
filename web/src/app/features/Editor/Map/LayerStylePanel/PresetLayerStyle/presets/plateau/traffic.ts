import { PresetStyle } from "../types";

export const plateauTraffic: PresetStyle = {
  id: "plateauTraffic",
  title: "Traffic",
  testId: "preset-style-plateau-traffic",
  style: {
    polygon: {
      fillColor: {
        expression: {
          conditions: [
            [
              '${attributes["tran:function"][0]} !== "a"',
              'color("#969CB4", 1)'
            ],
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
    }
  }
};
