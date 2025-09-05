import { ValueType as GQLValueType } from "@reearth/services/gql";
import { css } from "@reearth/services/theme";

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
  aspectRatio?: number;
};

export type Spacing = {
  bottom: number;
  left: number;
  right: number;
  top: number;
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

// Similar to Cesium
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

export type Timeline = {
  startTime?: string;
  endTime?: string;
  currentTime?: string;
};

// Don't forget adding a new field to valueTypeMapper also!
export type ValueTypes = {
  string: string;
  number: number;
  bool: boolean;
  latlng: LatLng;
  latlngheight: LatLngHeight;
  url: string;
  typography: Typography;
  coordinates: Coordinates;
  polygon: Polygon;
  rect: Rect;
  ref: string;
  tiletype: string;
  spacing: Spacing;
  array: unknown[];
  timeline: Timeline;
  camera: DataCamera;
};

export type DataCamera = {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
};

const valueTypeMapper: Record<GQLValueType, ValueType> = {
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
  [GQLValueType.Spacing]: "spacing",
  [GQLValueType.Array]: "array",
  [GQLValueType.Timeline]: "timeline"
};
export type Credit = {
  description?: string;
  logo?: string;
  creditUrl?: string;
};

export type ValueType = keyof ValueTypes;

export const valueFromGQL = (val: unknown, type: GQLValueType) => {
  const t = valueTypeFromGQL(type);
  if (typeof val === "undefined" || val === null || !t) {
    return undefined;
  }
  const ok = typeof val !== "undefined" && val !== null;
  let newVal = val;
  if (t === "camera" && val && typeof val === "object" && "altitude" in val) {
    newVal = {
      ...val,
      height: val.altitude
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
      textAlign: val.textAlign.toLowerCase()
    };
  }
  return { type: t, value: newVal ?? undefined, ok };
};

export function valueToGQL<T extends ValueType>(
  val: ValueTypes[T] | null | undefined,
  type: T
) {
  if (type === "camera" && val && typeof val === "object") {
    const { aspectRatio, height, ...rest } = val as Camera;
    const v: DataCamera = { ...rest, altitude: height };
    return v;
  }
  return val ?? null;
}

export const valueTypeFromGQL = (t: GQLValueType): ValueType => {
  return valueTypeMapper[t];
};

export const valueTypeToGQL = (t: ValueType): GQLValueType | undefined => {
  return (Object.keys(valueTypeMapper) as GQLValueType[]).find(
    (k) => valueTypeMapper[k] === t
  );
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
  return `${(t?.italic ?? d?.italic) ? "italic " : ""}${
    (t?.bold ?? d?.bold)
      ? "bold "
      : (t?.fontWeight ?? d?.fontWeight ?? "") + " "
  }${t?.fontSize ?? d?.fontSize ?? 16}px ${
    ff ? (ff.includes(`"`) ? ff : `"${ff}"`) : "sans-serif"
  }`;
};

export const toTextDecoration = (t?: Typography) =>
  t?.underline ? "underline" : "none";

export const typographyStyles = (t?: Typography) => {
  if (!t) return null;
  return css`
    font: ${toCSSFont(t)};
    text-decoration: ${toTextDecoration(t)};
    color: ${t.color ?? null};
    text-align: ${t.textAlign ?? null};
  `;
};

export const zeroValues: Partial<Record<ValueType, ValueTypes[ValueType]>> = {
  bool: false,
  string: ""
};
