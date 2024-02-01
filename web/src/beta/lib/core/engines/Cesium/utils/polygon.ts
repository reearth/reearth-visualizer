// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/cesium-helpers/src/convertPolygonToHierarchyArray.ts

import { Cartesian3, type PolygonHierarchy } from "@cesium/engine";
import unkinkPolygon from "@turf/unkink-polygon";
import type { LineString, MultiPolygon, Polygon, Position } from "geojson";

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}

function coordinatesToPositionsArray(coordinates: readonly Position[][]): Cartesian3[][] {
  return coordinates.map(coordinates =>
    coordinates.map(([x, y]) => Cartesian3.fromDegrees(x, y, 0)),
  );
}

export function convertGeometryToPositionsArray(
  geometry: LineString | Polygon | MultiPolygon,
): Cartesian3[][] {
  return (
    geometry.type === "LineString"
      ? coordinatesToPositionsArray([geometry.coordinates])
      : geometry.type === "Polygon"
      ? coordinatesToPositionsArray(geometry.coordinates)
      : geometry.coordinates.flatMap(coordinates => coordinatesToPositionsArray(coordinates))
  ).filter(({ length }) => length > 0);
}

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
