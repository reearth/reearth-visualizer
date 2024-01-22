import { type Feature, type MultiPolygon, type Polygon } from "geojson";
import { type SetRequired } from "type-fest";

export const SKETCH_OBJECT = "SKETCH_OBJECT";

export type SketchType =
  | "marker"
  | "polyline"
  | "circle"
  | "rectangle"
  | "polygon"
  | "extrudedCircle"
  | "extrudedRectangle"
  | "extrudedPolygon";

export function isSketchType(value: unknown): value is SketchType {
  return (
    value === "marker" ||
    value === "polyline" ||
    value === "circle" ||
    value === "rectangle" ||
    value === "polygon" ||
    value === "extrudedCircle" ||
    value === "extrudedRectangle" ||
    value === "extrudedPolygon"
  );
}

export interface SketchFeatureProperties {
  id: string;
  type?: SketchType;
  positions?: Array<[number, number, number]>;
  extrudedHeight?: number;
}

export type SketchFeature = Feature<Polygon | MultiPolygon, SketchFeatureProperties>;

export type GeometryFeature = SetRequired<Feature<Polygon | MultiPolygon>, "id">;
