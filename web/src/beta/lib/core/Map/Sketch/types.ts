import { Feature as GeojsonFeature, MultiPolygon, Polygon, Point, LineString } from "geojson";

import { Position3d } from "../../types";

export type SketchType =
  | "marker"
  | "polyline"
  | "circle"
  | "rectangle"
  | "polygon"
  | "extrudedCircle"
  | "extrudedRectangle"
  | "extrudedPolygon";

export type GeometryOptionsXYZ = {
  type: SketchType;
  controlPoints: Position3d[];
};

export type SketchFeature = GeojsonFeature<
  Polygon | MultiPolygon | Point | LineString,
  {
    id: string;
    type: SketchType;
    positions: readonly Position3d[];
    extrudedHeight: number;
  }
>;

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
