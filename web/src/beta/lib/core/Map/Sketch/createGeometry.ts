import { Cartesian3, Cartographic, Math as CesiumMath, type Ellipsoid } from "@cesium/engine";
import ellipse from "@turf/ellipse";
import { lineString, polygon } from "@turf/helpers";
import { type LineString, type MultiPolygon, type Polygon } from "geojson";

import { type SketchGeometryType } from "./types";

const cartographicScratch = new Cartographic();
const cartesianScratch1 = new Cartesian3();
const cartesianScratch2 = new Cartesian3();

function createCircle(
  controlPoints: readonly Cartesian3[],
  ellipsoid?: Ellipsoid,
): Polygon | undefined {
  if (controlPoints.length !== 2) {
    return;
  }
  const radius = Cartesian3.distance(controlPoints[0], controlPoints[1]);
  if (radius === 0) {
    return;
  }
  try {
    const cartographic = Cartographic.fromCartesian(
      controlPoints[0],
      ellipsoid,
      cartographicScratch,
    );
    const feature = ellipse(
      [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)],
      radius,
      radius,
      { units: "meters" },
    );
    return feature.geometry;
  } catch (error) {
    console.error(error);
  }
  return;
}

function createRectangle(
  controlPoints: readonly Cartesian3[],
  ellipsoid?: Ellipsoid,
): LineString | Polygon | undefined {
  if (controlPoints.length !== 2 && controlPoints.length !== 3) {
    return;
  }
  try {
    if (controlPoints.length === 2) {
      const feature = lineString(
        controlPoints.map(controlPoint => {
          const cartographic = Cartographic.fromCartesian(
            controlPoint,
            ellipsoid,
            cartographicScratch,
          );
          return [
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
          ];
        }),
      );
      return feature.geometry;
    }

    // Rectangle from 3 points.
    const [p1, p2, p3] = controlPoints;
    const projection = Cartesian3.projectVector(
      Cartesian3.subtract(p3, p1, cartesianScratch1),
      Cartesian3.subtract(p2, p1, cartesianScratch2),
      cartesianScratch1,
    );
    const offset = Cartesian3.subtract(
      p3,
      Cartesian3.add(p1, projection, cartesianScratch1),
      cartesianScratch2,
    );
    const p4 = Cartesian3.add(p1, offset, cartesianScratch1);
    const p5 = Cartesian3.add(p2, offset, cartesianScratch2);
    const feature = polygon([
      [p1, p2, p5, p4, p1].map(controlPoint => {
        const cartographic = Cartographic.fromCartesian(
          controlPoint,
          ellipsoid,
          cartographicScratch,
        );
        return [
          CesiumMath.toDegrees(cartographic.longitude),
          CesiumMath.toDegrees(cartographic.latitude),
        ];
      }),
    ]);
    return feature.geometry;
  } catch (error) {
    console.error(error);
  }
  return;
}

function createPolygon(
  controlPoints: readonly Cartesian3[],
  ellipsoid?: Ellipsoid,
): LineString | Polygon | undefined {
  if (controlPoints.length < 2) {
    return;
  }
  try {
    if (controlPoints.length === 2) {
      const feature = lineString(
        controlPoints.map(controlPoint => {
          const cartographic = Cartographic.fromCartesian(
            controlPoint,
            ellipsoid,
            cartographicScratch,
          );
          return [
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
          ];
        }),
      );
      return feature.geometry;
    }

    const feature = polygon([
      [...controlPoints, controlPoints[0]].map(controlPoint => {
        const cartographic = Cartographic.fromCartesian(
          controlPoint,
          ellipsoid,
          cartographicScratch,
        );
        return [
          CesiumMath.toDegrees(cartographic.longitude),
          CesiumMath.toDegrees(cartographic.latitude),
        ];
      }),
    ]);
    return feature.geometry;
  } catch (error) {
    console.error(error);
  }
  return;
}

export interface GeometryOptions {
  type: SketchGeometryType;
  controlPoints: readonly Cartesian3[];
  ellipsoid?: Ellipsoid;
}

export function createGeometry({
  type,
  controlPoints,
  ellipsoid,
}: GeometryOptions): LineString | Polygon | MultiPolygon | undefined {
  switch (type) {
    case "circle":
      return createCircle(controlPoints, ellipsoid);
    case "rectangle":
      return createRectangle(controlPoints, ellipsoid);
    case "polygon":
      return createPolygon(controlPoints, ellipsoid);
    default:
      return;
  }
}
