import { LayerAppearanceTypes } from "@reearth/core";
import type { LayerStyle } from "@reearth/services/api/layerStyle";
import { describe, test, expect } from "vitest";

import { defaultStyle } from "../features/Editor/Map/LayerStylePanel/PresetLayerStyle/presets";

import { getLayerStyleValue } from "./layer-style";

describe("getLayerStyleValue", () => {
  const mockLayerStyles: LayerStyle[] = [
    {
      id: "style1",
      name: "Style 1",
      value: {
        marker: { heightReference: "relative" },
        polyline: { strokeColor: "#FF0000" }
      } as Partial<LayerAppearanceTypes>
    },
    {
      id: "style2",
      name: "Style 2",
      value: {
        polygon: {
          fillColor: { expression: "color('#00ff00',0.5)" }
        }
      } as Partial<LayerAppearanceTypes>
    },
    { id: "style4", name: "Style 4", value: undefined }
  ];

  test("should return layer style value when matching id is found", () => {
    const result = getLayerStyleValue(mockLayerStyles, "style1");
    expect(result).toEqual({
      marker: { heightReference: "relative" },
      polyline: { strokeColor: "#FF0000" }
    });
  });

  test("should return default style when id is not found", () => {
    const result = getLayerStyleValue(mockLayerStyles, "nonexistent");
    expect(result).toEqual(defaultStyle.style);
  });

  test("should return default style when layer styles is undefined", () => {
    const result = getLayerStyleValue(undefined, "style1");
    expect(result).toEqual(defaultStyle.style);
  });

  test("should return default style when value is undefined", () => {
    const result = getLayerStyleValue(mockLayerStyles, "style4");
    expect(result).toEqual(defaultStyle.style);
  });

  test("should return empty object for czml type", () => {
    const result = getLayerStyleValue(mockLayerStyles, undefined, "czml");
    expect(result).toEqual({});
  });

  test("should return empty object for kml type", () => {
    const result = getLayerStyleValue(mockLayerStyles, undefined, "KML");
    expect(result).toEqual({});
  });

  test("should handle case-insensitive type matching", () => {
    const result = getLayerStyleValue(mockLayerStyles, undefined, "CZML");
    expect(result).toEqual({});
  });

  test("should return style value for other types", () => {
    const result = getLayerStyleValue(mockLayerStyles, undefined, "geojson");
    expect(result).toEqual(defaultStyle.style);
  });

  test("should handle undefined type parameter", () => {
    const result = getLayerStyleValue(mockLayerStyles, "style2", undefined);
    expect(result).toEqual({
      polygon: {
        fillColor: { expression: "color('#00ff00',0.5)" }
      }
    });
  });
});
