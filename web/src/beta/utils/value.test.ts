import { ValueType as GQLValueType } from "@reearth/services/gql";
import { describe, it, expect } from "vitest";

import {
  valueFromGQL,
  valueToGQL,
  valueTypeFromGQL,
  valueTypeToGQL,
  getCSSFontFamily,
  toCSSFont,
  toTextDecoration
} from "./value";

describe("valueFromGQL", () => {
  it("should convert camera type from GQL and have height property", () => {
    const gqlCamera = {
      lat: 35.123,
      lng: 139.456,
      altitude: 1000,
      heading: 45,
      pitch: 30,
      roll: 0,
      fov: 60
    };

    const result = valueFromGQL(gqlCamera, GQLValueType.Camera);

    expect(result?.type).toBe("camera");
    expect(result?.value).toHaveProperty("height", 1000);
  });

  it("should handle null or undefined values", () => {
    const result = valueFromGQL(null, GQLValueType.String);
    expect(result).toBeUndefined();
  });

  it("should convert typography textAlign to lowercase", () => {
    const typography = {
      fontFamily: "Arial",
      fontSize: 16,
      textAlign: "CENTER"
    };

    const result = valueFromGQL(typography, GQLValueType.Typography);

    expect(result?.value).toHaveProperty("textAlign", "center");
  });
});

describe("valueToGQL", () => {
  it("should convert camera type to GQL format with altitude property", () => {
    const camera = {
      lat: 35.123,
      lng: 139.456,
      heading: 45,
      pitch: 30,
      roll: 0,
      fov: 60,
      aspectRatio: 1.5,
      altitude: 1000,
      height: 1000
    };

    const result = valueToGQL(camera, "camera");

    expect(result).toHaveProperty("altitude", 1000);
    expect(result).not.toHaveProperty("aspectRatio");
  });

  it("should return null for null or undefined values", () => {
    const result = valueToGQL(null, "string");
    expect(result).toBeNull();
  });
});

describe("valueTypeFromGQL & valueTypeToGQL", () => {
  it("should convert between GQL and internal value types", () => {
    const gqlType = GQLValueType.String;
    const internalType = valueTypeFromGQL(gqlType);

    expect(internalType).toBe("string");

    const backToGQL = valueTypeToGQL(internalType);
    expect(backToGQL).toBe(gqlType);
  });
});

describe("getCSSFontFamily", () => {
  it("should format YuGothic font family properly", () => {
    const result = getCSSFontFamily("YuGothic");
    expect(result).toBe(
      '"游ゴシック体", YuGothic, "游ゴシック Medium", "Yu Gothic Medium", "游ゴシック", "Yu Gothic"'
    );
  });

  it("should return undefined for undefined input", () => {
    const result = getCSSFontFamily(undefined);
    expect(result).toBeUndefined();
  });

  it("should return the input for non-YuGothic fonts", () => {
    const result = getCSSFontFamily("Arial");
    expect(result).toBe("Arial");
  });
});

describe("toCSSFont", () => {
  it("should format typography into a CSS font string", () => {
    const typography = {
      fontFamily: "Arial",
      fontSize: 16,
      fontWeight: 400,
      bold: false,
      italic: false
    };

    const result = toCSSFont(typography);
    expect(result).toBe('400 16px "Arial"');
  });

  it("should handle bold and italic properly", () => {
    const typography = {
      fontFamily: "Arial",
      fontSize: 16,
      bold: true,
      italic: true
    };

    const result = toCSSFont(typography);
    expect(result).toBe('italic bold 16px "Arial"');
  });

  it("should use default values when properties are missing", () => {
    const result = toCSSFont({});
    expect(result).toContain("16px sans-serif");
  });
});

describe("toTextDecoration", () => {
  it("should return underline when underline is true", () => {
    const typography = { underline: true };
    const result = toTextDecoration(typography);
    expect(result).toBe("underline");
  });

  it("should return none when underline is false or undefined", () => {
    expect(toTextDecoration({ underline: false })).toBe("none");
    expect(toTextDecoration({})).toBe("none");
    expect(toTextDecoration(undefined)).toBe("none");
  });
});
