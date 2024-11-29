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
      clampToGround: true
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
        }
      ],
      notSupported: false
    }
  ],
  polyline: [
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

    expect(polygonNode?.expression).toBe("${extrudedHeight}");
    expect(polygonNode).toHaveProperty("expression");
  });

  it("should correctly convert 'polygon' layer style with color expression", () => {
    const fillColorNode = styleNodes.polygon.find((n) => n.id === "fillColor");
    expect(fillColorNode?.expression).toBe("color('#ffffff',0.8)");
    expect(fillColorNode?.field).toBe("color");
  });

  it("should correctly convert 'polyline' layer style", () => {
    const clampToGroundNode = styleNodes.polyline.find(
      (n) => n.id === "clampToGround"
    );
    expect(clampToGroundNode?.value).toBe(true);
  });

  it("should return empty nodes if 'layerStyle' is undefined", () => {
    const result = convertToStyleNodes(undefined);
    expect(result["3dtiles"]).toEqual([]);
    expect(result.marker).toEqual([]);
  });
});

describe("convertToLayerStyleValue", () => {
  const layerStyle = convertToLayerStyleValue(mockStyleNodes);

  it("should correctly convert marker node with conditions to LayerStyle", () => {
    const pointSize = layerStyle?.marker?.pointSize;
    if (typeof pointSize === "object" && pointSize?.expression) {
      if (
        typeof pointSize.expression === "object" &&
        pointSize.expression.conditions
      ) {
        expect(pointSize.expression.conditions).toHaveLength(2);
        expect(pointSize.expression.conditions[0]).toEqual([
          "${marker-size} === 'small'",
          "8"
        ]);
        expect(pointSize.expression.conditions[1]).toEqual([
          "${marker-size} === 'medium'",
          "12"
        ]);
      }
    }
  });

  it("should correctly convert polyline and polygon nodes to LayerStyle", () => {
    expect(layerStyle?.polyline).toHaveProperty("strokeColor");
    expect(layerStyle?.polyline?.strokeColor).toBe("#FFFFFF");
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
    const value = parseStyleValue("select", "clamp");

    expect(value).toEqual({
      valueType: "value",
      value: "clamp",
      expression: undefined,
      conditions: undefined
    });
  });
  it("should  parse style value and return expression as value type", () => {
    const value = parseStyleValue("color", {
      expression: "color('#ffffff', 0.8)"
    });

    expect(value).toEqual({
      valueType: "expression",
      value: undefined,
      expression: "color('#ffffff', 0.8)",
      conditions: undefined
    });
  });
});

describe("parseConditions", () => {
  it("should parse conditions correctly", () => {
    const conditions = parseConditions("number", [
      ["${marker-size}==='medium'", "12"]
    ]);

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

it("should parse conditions with URL values correctly", () => {
  const conditions = parseConditions("model", [
    ["${type}==='1'", "'https://example.com/model.glb'"]
  ]);

  expect(conditions).toEqual([
    {
      variable: "${type}",
      operator: "===",
      value: "'1'",
      applyValue: "https://example.com/model.glb"
    }
  ]);
});

describe("generateStyleValue", () => {
  it("should generate style value'", () => {
    expect(generateStyleValue(mockStyleNodes?.model[0])).toEqual(
      "https://help.reearth.io/"
    );
  });
});

describe("generateConditions", () => {
  const conditions = generateConditions(
    "number",
    mockStyleNodes?.marker[0].conditions
  );

  it("should generate conditions'", () => {
    expect(conditions).toEqual([
      ["${marker-size} === 'small'", "8"],
      ["${marker-size} === 'medium'", "12"]
    ]);
  });
});

describe("wrapColor", () => {
  it("should wrap valid from 3-digit to 8-digit hex color", () => {
    expect(wrapColor("#FFF")).toBe("color('#FFF')");
    expect(wrapColor("#FFFFFF")).toBe("color('#FFFFFF')");
    expect(wrapColor("#FFFFFFFF")).toBe("color('#FFFFFFFF')");
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
});
