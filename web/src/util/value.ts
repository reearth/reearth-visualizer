import { Color } from "cesium";

import { ValueType as GQLValueType } from "@reearth/gql";
import { css } from "@reearth/theme";

export type LatLng = {
  lat: number;
  lng: number;
};

export type LatLngHeight = {
  lat: number;
  lng: number;
  height: number;
};

export type Camera = {
  lat: number;
  lng: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
};

export type Typography = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify" | "justify_all";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type Coordinates = LatLngHeight[];

export type Polygon = LatLngHeight[][];

export type Rect = {
  west: number;
  south: number;
  east: number;
  north: number;
};

// Ideal for plugin developers, but it's hard to implement it with Cesium
export type Plane = {
  location: LatLngHeight;
  width: number;
  height: number;
  length: number;
  heading: number;
  pitch: number;
};

// Familiar with Cesium
export type EXPERIMENTAL_clipping = {
  planes?: {
    normal: {
      x: number;
      y: number;
      z: number;
    };
    distance: number;
  }[];
  location: LatLngHeight;
  /**
   * x-axis
   */
  width?: number;
  /**
   * y-axis
   */
  length?: number;
  /**
   * z-axis
   */
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
};

// Don't forget adding a new field to valueTypeMapper also!
export type ValueTypes = {
  string: string;
  number: number;
  bool: boolean;
  latlng: LatLng;
  latlngheight: LatLngHeight;
  url: string;
  camera: Camera;
  typography: Typography;
  coordinates: Coordinates;
  polygon: Polygon;
  rect: Rect;
  ref: string;
  tiletype: string;
};

const valueTypeMapper: Partial<Record<GQLValueType, ValueType>> = {
  [GQLValueType.Bool]: "bool",
  [GQLValueType.Number]: "number",
  [GQLValueType.String]: "string",
  [GQLValueType.Url]: "url",
  [GQLValueType.Latlng]: "latlng",
  [GQLValueType.Latlngheight]: "latlngheight",
  [GQLValueType.Camera]: "camera",
  [GQLValueType.Typography]: "typography",
  [GQLValueType.Coordinates]: "coordinates",
  [GQLValueType.Polygon]: "polygon",
  [GQLValueType.Rect]: "rect",
  [GQLValueType.Ref]: "ref",
};

export type ValueType = keyof ValueTypes;

export const valueFromGQL = (val: any, type: GQLValueType) => {
  const t = valueTypeFromGQL(type);
  if (typeof val === "undefined" || val === null || !t) {
    return undefined;
  }
  const ok = typeof val !== "undefined" && val !== null;
  let newVal = val;
  if (t === "camera" && val && typeof val === "object" && "altitude" in val) {
    newVal = {
      ...val,
      height: val.altitude,
    };
  }
  if (
    t === "typography" &&
    val &&
    typeof val === "object" &&
    "textAlign" in val &&
    typeof val.textAlign === "string"
  ) {
    newVal = {
      ...val,
      textAlign: val.textAlign.toLowerCase(),
    };
  }
  return { type: t, value: newVal ?? undefined, ok };
};

export function valueToGQL<T extends ValueType>(
  val: ValueTypes[T] | null | undefined,
  type: T,
): any {
  if (type === "camera" && val && typeof val === "object" && "height" in val) {
    return {
      ...(val as any),
      altitude: (val as any).height,
    };
  }
  return val ?? null;
}

export const valueTypeFromGQL = (t: GQLValueType): ValueType | undefined => {
  return valueTypeMapper[t];
};

export const valueTypeToGQL = (t: ValueType): GQLValueType | undefined => {
  return (Object.keys(valueTypeMapper) as GQLValueType[]).find(k => valueTypeMapper[k] === t);
};

export const toGQLSimpleValue = (v: unknown): string | number | boolean | undefined => {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? v : undefined;
};

export const getCSSFontFamily = (f?: string) => {
  return !f
    ? undefined
    : f === "YuGothic"
    ? `"游ゴシック体", YuGothic, "游ゴシック Medium", "Yu Gothic Medium", "游ゴシック", "Yu Gothic"`
    : f;
};

export const toCSSFont = (t?: Typography, d?: Typography) => {
  const ff = getCSSFontFamily(t?.fontFamily ?? d?.fontFamily)
    ?.replace("'", '"')
    .trim();
  return `${t?.italic ?? d?.italic ? "italic " : ""}${
    t?.bold ?? d?.bold ? "bold " : (t?.fontWeight ?? d?.fontWeight ?? "") + " " ?? ""
  }${t?.fontSize ?? d?.fontSize ?? 16}px ${
    ff ? (ff.includes(`"`) ? ff : `"${ff}"`) : "sans-serif"
  }`;
};

export const toTextDecoration = (t?: Typography) => (t?.underline ? "underline" : "none");

export const toColor = (c?: string) => {
  if (!c || typeof c !== "string") return undefined;

  // support alpha
  const m = c.match(/^#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})$|^#([A-Fa-f0-9]{3})([A-Fa-f0-9])$/);
  if (!m) return Color.fromCssColorString(c);

  const alpha = parseInt(m[4] ? m[4].repeat(2) : m[2], 16) / 255;
  return Color.fromCssColorString(`#${m[1] ?? m[3]}`).withAlpha(alpha);
};

export const typographyStyles = (t?: Typography) => {
  if (!t) return null;
  return css`
    font: ${toCSSFont(t)};
    text-decoration: ${toTextDecoration(t)};
    color: ${t.color ?? null};
    text-align: ${t.textAlign ?? null};
  `;
};

export const zeroValues: { [key in ValueType]?: ValueTypes[ValueType] } = {
  bool: false,
  string: "",
};
