import { PresetStyle } from "../types";

export const plateauUrbanPlanningFirePrevention: PresetStyle = {
  id: "plateauUrbanPlanningFirePrevention",
  title: "Urban Planning (Fire Prevention)",
  testId: "preset-style-plateau-urban-planning-fire-prevention",
  style: {
    polygon: {
      fillColor: {
        expression: {
          conditions: [
            ['${urf_function} === "防火地域"', 'color("#ff3500cc", 1)'],
            ['${urf_function} === "準防火地域"', 'color("#cfa300cc", 1)'],
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

export const plateauUrbanPlanningHeightControlDistrict: PresetStyle = {
  id: "plateauUrbanPlanningHeightControlDistrict",
  title: "Urban Planning (Height Control District)",
  testId: "preset-style-plateau-urban-planning-height-control-district",
  style: {
    polygon: {
      fillColor: {
        expression: {
          conditions: [
            ['${attributes["gml:id"]} !== "aaa"', 'color("#006717CC", 1)'],
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

export const plateauUrbanPlanningUseDistrict: PresetStyle = {
  id: "plateauUrbanPlanningUseDistrict",
  title: "Urban Planning (Use District)",
  testId: "preset-style-plateau-urban-planning-use-district",
  style: {
    polygon: {
      fillColor: {
        expression: {
          conditions: [
            [
              '${urf_function} === "第1種低層住居専用地域"',
              'color("#00b285cc", 1)'
            ],
            [
              '${urf_function} === "第2種低層住居専用地域"',
              'color("#91CFB9cc", 1)'
            ],
            [
              '${urf_function} === "第1種中高層住居専用地域"',
              'color("#78ce3fcc", 1)'
            ],
            [
              '${urf_function} === "第2種中高層住居専用地域"',
              'color("#addf21cc", 1)'
            ],
            ['${urf_function} === "第1種住居地域"', 'color("#ebee5ecc", 1)'],
            ['${urf_function} === "第2種住居地域"', 'color("#ffd2b6cc", 1)'],
            ['${urf_function} === "準住居地域"', 'color("#ffa638cc", 1)'],
            ['${urf_function} === "近隣商業地域"', 'color("#ffb0c3cc", 1)'],
            ['${urf_function} === "商業地域"', 'color("#ff593dcc", 1)'],
            ['${urf_function} === "準工業地域"', 'color("#a794c5cc", 1)'],
            ['${urf_function} === "工業地域"', 'color("#b9eaffcc", 1)'],
            ['${urf_function} === "工業専用地域"', 'color("#5FC5FBcc", 1)'],
            [
              '${urf_function} !== "第1種低層住居専用地域"',
              'color("#e6e6e6", 1)'
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
