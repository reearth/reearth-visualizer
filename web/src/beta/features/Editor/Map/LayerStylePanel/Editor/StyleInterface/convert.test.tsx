import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { describe, expect, it } from "vitest";

import {
  checkExpressionAndConditions,
  convertToLayerStyleValue,
  convertToStyleNodes,
  generateConditions,
  generateStyleValue,
  parseConditions,
  parseStyleValue,
  unwrapColor,
  wrapColor
} from "./convert";
import { StyleNodes } from "./types";

const mockLayerStyle: LayerStyle = {
  id: "layer_style_01",
  name: "Style.01",
  value: {
    marker: {
      heightReference: "clamp"
    },
    polygon: {
      extrudedHeight: {
        expression: "${extrudedHeight}"
      },
      fillColor: {
        expression: "color('#ffffff',0.8)"
      },
      heightReference: "clamp"
    },
    polyline: {
      clampToGround: true,
      strokeColor: "#FFFFFF",
      strokeWidth: 2
    },
    "3dtiles": {}
  }
};

const mockStyleNodes: StyleNodes = {
  marker: [
    {
      id: "pointSize",
      type: "marker",
      title: "Point Size",
      field: "number",
      valueType: "conditions",
      value: undefined,
      conditions: [
        {
          variable: "${marker-size}",
          operator: "===",
          value: "'small'",
          applyValue: "8"
        },
        {
          variable: "${marker-size}",
          operator: "===",
          value: "'medium'",
          applyValue: "12"
        },
        {
          variable: "${marker-size}",
          operator: "===",
          value: "'large'",
          applyValue: "16"
        }
      ],
      notSupported: false
    }
  ],
  polyline: [
    {
      id: "clampToGround",
      type: "polyline",
      title: "Clamp To Ground",
      field: "switch",
      valueType: "value",
      value: true,
      notSupported: false
    },
    {
      id: "strokeColor",
      type: "polyline",
      title: "Stroke Color",
      field: "color",
      valueType: "value",
      value: "#FFFFFF",
      notSupported: false
    }
  ],
  polygon: [
    {
      id: "fillColor",
      type: "polygon",
      title: "Fill Color",
      field: "color",
      valueType: "expression",
      value: undefined,
      expression: "color('#ffffff',0.8)",
      notSupported: false
    }
  ],
  "3dtiles": [],
  model: [
    {
      id: "url",
      title: "Url",
      type: "model",
      field: "text",
      valueType: "value",
      value: "https://help.reearth.io/",
      notSupported: false
    }
  ]
};

describe("convertToStyleNodes", () => {
  const styleNodes = convertToStyleNodes(mockLayerStyle);
  it("should correctly convert 'marker' layer style", () => {
    const markerNode = styleNodes.marker.find(
      (n) => n.id === "heightReference"
    );

    expect(markerNode).toBeDefined();
    expect(markerNode?.valueType).toBe("value");
  });

  it("should correctly convert 'polygon' layer style with expressions", () => {
    const polygonNode = styleNodes.polygon.find(
      (n) => n.id === "extrudedHeight"
    );

    expect(polygonNode).toBeDefined();
    expect(polygonNode?.expression).toBe("${extrudedHeight}");
    expect(polygonNode).toHaveProperty("expression");
  });

  it("should correctly convert 'polygon' layer style with color expression", () => {
    const fillColorNode = styleNodes.polygon.find((n) => n.id === "fillColor");

    expect(fillColorNode?.expression).toBe("color('#ffffff',0.8)");
    expect(fillColorNode?.field).toBe("color");
  });

  it("should correctly convert 'polyline' layer style", () => {
    const strokeColorNode = styleNodes.polyline.find(
      (n) => n.id === "strokeColor"
    );

    expect(strokeColorNode).toBeDefined();
    expect(strokeColorNode?.value).toBe("#FFFFFF");
  });

  it("should return empty nodes for '3dtiles'", () => {
    expect(styleNodes["3dtiles"]).toEqual([]);
  });

  it("should return empty nodes if 'layerStyle' is undefined", () => {
    const result = convertToStyleNodes(undefined);
    expect(result["3dtiles"]).toEqual([]);
    expect(result.marker).toEqual([]);
    expect(result.polygon).toEqual([]);
  });
});

describe("convertToLayerStyleValue", () => {
  const layerStyle = convertToLayerStyleValue(mockStyleNodes);

  it("should correctly convert marker node with conditions to LayerStyle", () => {
    const pointSize = layerStyle?.marker?.pointSize;
    if (typeof pointSize === "object" && pointSize?.expression) {
      expect(pointSize.expression).toHaveProperty("conditions");
      if (
        typeof pointSize.expression === "object" &&
        pointSize.expression.conditions
      ) {
        expect(pointSize.expression.conditions).toHaveLength(3);
        expect(pointSize.expression.conditions[0]).toEqual([
          "${marker-size} === 'small'",
          "8"
        ]);
        expect(pointSize.expression.conditions[1]).toEqual([
          "${marker-size} === 'medium'",
          "12"
        ]);
        expect(pointSize.expression.conditions[2]).toEqual([
          "${marker-size} === 'large'",
          "16"
        ]);
      }
    } else {
      throw new Error("pointSize is not an expression");
    }
  });

  it("should correctly convert polyline nodes to LayerStyle", () => {
    expect(layerStyle?.polyline).toHaveProperty("strokeColor");
    expect(layerStyle?.polyline?.strokeColor).toBe("#FFFFFF");
  });

  it("should correctly convert polygon nodes to LayerStyle", () => {
    expect(layerStyle?.polygon).toHaveProperty("fillColor");
    if (typeof layerStyle?.polygon?.fillColor === "object") {
      expect(layerStyle.polygon.fillColor.expression).toBe(
        "color('#ffffff',0.8)"
      );
    }
  });

  it("should correctly handle empty 3dtiles node to LayerStyle", () => {
    expect(layerStyle).not.toHaveProperty("3dtiles");
  });
});

describe("parseStyleValue", () => {
  it("should  parse style value  and return value as value type", () => {
    const value = parseStyleValue("clamp");

    expect(value).toEqual({
      valueType: "value",
      value: "clamp",
      expression: undefined,
      conditions: undefined
    });
  });
  it("should  parse style value and return expression as value type", () => {
    const value = parseStyleValue({ expression: "color('#ffffff', 0.8)" });

    expect(value).toEqual({
      valueType: "expression",
      value: undefined,
      expression: "color('#ffffff', 0.8)",
      conditions: undefined
    });
  });

  it("should parse style value and return conditions as value type", () => {
    const value = parseStyleValue({
      expression: {
        conditions: [["${marker-size}==='small'", "8"]]
      }
    });

    expect(value).toEqual({
      valueType: "conditions",
      value: undefined,
      expression: undefined,
      conditions: [
        {
          variable: "${marker-size}",
          operator: "===",
          value: "'small'",
          applyValue: "8"
        }
      ]
    });
  });
});

describe("parseConditions", () => {
  it("should parse conditions correctly", () => {
    const conditions = parseConditions([["${marker-size}==='medium'", "12"]]);

    expect(conditions).toEqual([
      {
        variable: "${marker-size}",
        operator: "===",
        value: "'medium'",
        applyValue: "12"
      }
    ]);
  });
});

describe("generateStyleValue", () => {
  it("should generate style value'", () => {
    expect(generateStyleValue(mockStyleNodes?.polygon[0])).toEqual({
      expression: "color('#ffffff',0.8)"
    });
    expect(generateStyleValue(mockStyleNodes?.model[0])).toEqual(
      "https://help.reearth.io/"
    );
  });
});

describe("generateConditions", () => {
  const conditions = generateConditions(mockStyleNodes?.marker[0].conditions);

  it("should generate conditions'", () => {
    expect(conditions).toEqual([
      ["${marker-size} === 'small'", "8"],
      ["${marker-size} === 'medium'", "12"],
      ["${marker-size} === 'large'", "16"]
    ]);
  });
});

describe("wrapColor", () => {
  it("should wrap valid from 3-digit to 8-digit hex color", () => {
    expect(wrapColor("#FFF")).toBe("color('#FFF')");
    expect(wrapColor("#FFFFFF")).toBe("color('#FFFFFF')");
    expect(wrapColor("#FFFFFFFF")).toBe("color('#FFFFFFFF')");
  });

  it("should not wrap invalid color", () => {
    expect(wrapColor("invalidColor")).toBe("invalidColor");
  });

  it("should not wrap if the string is not a hex color", () => {
    const color = wrapColor("rgba(255, 255, 255, 1)");
    expect(color).toBe("rgba(255, 255, 255, 1)");
  });
});

describe("unwrapColor", () => {
  it("should unwrap a wrapped color string", () => {
    const color = unwrapColor("color('#FFFFFF')");
    expect(color).toBe("#FFFFFF");
  });

  it("should return the same value if the string is not wrapped with color()", () => {
    const color = unwrapColor("#FFFFFF");
    expect(color).toBe("#FFFFFF");
  });
});

describe("checkExpressionAndConditions", () => {
  it("should check the value type of style node", () => {
    expect(checkExpressionAndConditions(true)).toBe("value");
    expect(
      checkExpressionAndConditions({
        expression: {
          conditions: [["${marker-size}==='medium'", "12"]]
        }
      })
    ).toBe("conditions");
    expect(checkExpressionAndConditions({ expression: "${stroke}" })).toBe(
      "expression"
    );
  });

  it("should return invalid value type", () => {
    expect(
      checkExpressionAndConditions({ expression: "${stroke-width}" })
    ).not.toBe("value");
  });
});
