// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/cesium-helpers/src/convertPolygonToHierarchyArray.ts

import { Cartesian3, type PolygonHierarchy } from "@cesium/engine";
import unkinkPolygon from "@turf/unkink-polygon";
import { type MultiPolygon, type Polygon, type Position } from "geojson";

function coordinatesToHierarchy(coordinates: readonly Position[][]): PolygonHierarchy | undefined {
  return coordinates.length > 0
    ? {
        positions: coordinates[0].map(([x, y]) => Cartesian3.fromDegrees(x, y, 0)),
        holes: coordinates.slice(1).map(coordinates => ({
          positions: coordinates.map(([x, y]) => Cartesian3.fromDegrees(x, y, 0)),
          holes: [],
        })),
      }
    : undefined;
}

export function convertPolygonToHierarchyArray(
  polygon: Polygon | MultiPolygon,
): PolygonHierarchy[] {
  const polygons = unkinkPolygon(polygon).features;
  return polygons
    .map(polygon => coordinatesToHierarchy(polygon.geometry.coordinates))
    .filter(isNotNullish);
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}
