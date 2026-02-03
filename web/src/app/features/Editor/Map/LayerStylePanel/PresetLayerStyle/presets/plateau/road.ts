import { PresetStyle } from "../types";

export const plateauRoad: PresetStyle = {
  id: "plateauRoad",
  title: "Road",
  testId: "preset-style-plateau-road",
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
