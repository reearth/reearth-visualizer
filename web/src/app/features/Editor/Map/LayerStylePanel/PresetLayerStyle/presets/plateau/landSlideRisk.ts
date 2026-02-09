import { PresetStyle } from "../types";

export const plateauLandslideRiskSteepSlopeFailure: PresetStyle = {
  id: "plateauLandslideRiskSteepSlopeFailure",
  title: "Landslide Risk (Steep Slope Failure)",
  titleJa: "土砂災害（急傾斜）",
  testId: "preset-style-plateau-land-slide-risk-steep-slope-failure",
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

export const plateauLandslideRiskDebrisFlow: PresetStyle = {
  id: "plateauLandslideRiskDebrisFlow",
  title: "Landslide Risk (Debris Flow)",
  titleJa: "土砂災害（土石流）",
  testId: "preset-style-plateau-land-slide-risk-debris-flow",
  style: {
    polygon: {
      show: {
        expression: {
          conditions: [
            [
              "${attributes['urf:disasterType_code']} === '2' && (${attributes['urf:areaType_code']} === '1' || ${attributes['urf:areaType_code']} === '2')",
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
              'color("#EDD86F", 1)'
            ],
            [
              '(!(${attributes["urf:areaType_code"]} === "" || ${attributes["urf:areaType_code"]} === null || isNaN(Number(${attributes["urf:areaType_code"]}))) ? Number(${attributes["urf:areaType_code"]}) : null) === 2',
              'color("#b35464", 1)'
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

export const plateauLandslideRiskLandslide: PresetStyle = {
  id: "plateauLandslideRiskLandslide",
  title: "Landslide Risk (Landslide)",
  titleJa: "土砂災害（地すべり）",
  testId: "preset-style-plateau-land-slide-risk-landslide",
  style: {
    polygon: {
      show: {
        expression: {
          conditions: [
            [
              "${attributes['urf:disasterType_code']} === '3' && (${attributes['urf:areaType_code']} === '1' || ${attributes['urf:areaType_code']} === '2')",
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
              'color("#FFB74C", 1)'
            ],
            [
              '(!(${attributes["urf:areaType_code"]} === "" || ${attributes["urf:areaType_code"]} === null || isNaN(Number(${attributes["urf:areaType_code"]}))) ? Number(${attributes["urf:areaType_code"]}) : null) === 2',
              'color("#CA4C95", 1)'
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
