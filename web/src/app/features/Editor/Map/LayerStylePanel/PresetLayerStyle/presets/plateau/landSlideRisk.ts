import { PresetStyle } from "../types";

export const plateauLandSlideRisk: PresetStyle = {
  id: "plateauLandSlideRisk",
  title: "Land Slide Risk",
  testId: "preset-style-plateau-land-slide-risk",
  style: {
    polygon: {
      show: {
        expression: {
          conditions: [
            [
              "${attributes['urf:disasterType_code']} === '1' && (${attributes['urf:areaType_code']} === '1' || ${attributes['urf:areaType_code']} === '2')",
              "true"
            ],
            ["true", "false"]
          ]
        }
      },
      fillColor: {
        expression: {
          conditions: [
            [
              '(!(${attributes["urf:areaType_code"]} === "" || ${attributes["urf:areaType_code"]} === null || isNaN(Number(${attributes["urf:areaType_code"]}))) ? Number(${attributes["urf:areaType_code"]}) : null) === 1',
              'color("#FFED4C", 1)'
            ],
            [
              '(!(${attributes["urf:areaType_code"]} === "" || ${attributes["urf:areaType_code"]} === null || isNaN(Number(${attributes["urf:areaType_code"]}))) ? Number(${attributes["urf:areaType_code"]}) : null) === 2',
              'color("#FB684C", 1)'
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
