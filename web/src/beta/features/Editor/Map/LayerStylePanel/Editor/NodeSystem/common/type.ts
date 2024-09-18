import {
  AppearanceTypes,
  Cesium3DTilesAppearance,
  MarkerAppearance,
  ModelAppearance,
  PolygonAppearance,
  PolylineAppearance
} from "@reearth/core";

export type HeightReferenceAppearanceType =
  | MarkerAppearance
  | PolygonAppearance
  | ModelAppearance;

export type AppearanceType =
  | "marker"
  | "model"
  | "polygon"
  | "polyline"
  | "3dtiles";

export type AppearanceMap = Pick<
  AppearanceTypes,
  "marker" | "model" | "polyline" | "polygon" | "3dtiles"
>;

export type AppearanceTypeKeys =
  | keyof MarkerAppearance
  | keyof ModelAppearance
  | keyof PolygonAppearance
  | keyof PolylineAppearance
  | keyof Cesium3DTilesAppearance;
