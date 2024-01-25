import { Cartesian3, Cartographic, Math as CesiumMath, type Ellipsoid } from "@cesium/engine";
import ellipse from "@turf/ellipse";
import { lineString, polygon, point } from "@turf/helpers";
import { type LineString, type MultiPolygon, type Polygon, type Point } from "geojson";

import { type SketchType } from "../../../Map/Sketch/types";

const cartographicScratch = new Cartographic();
const cartesianScratch1 = new Cartesian3();
const cartesianScratch2 = new Cartesian3();

function createPoint(
  controlPoints: readonly Cartesian3[],
  ellipsoid?: Ellipsoid,
): Point | undefined {
  if (controlPoints.length !== 1) {
    return;
  }
  try {
    const cartographic = Cartographic.fromCartesian(
      controlPoints[0],
      ellipsoid,
      cartographicScratch,
    );
    const feature = point([
      CesiumMath.toDegrees(cartographic.longitude),
      CesiumMath.toDegrees(cartographic.latitude),
    ]);
    return feature.geometry;
  } catch (error) {
    console.error(error);
  }
  return;
}

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

function createPolyline(
  controlPoints: readonly Cartesian3[],
  ellipsoid?: Ellipsoid,
): LineString | undefined {
  if (controlPoints.length < 2) {
    return;
  }
  try {
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
  type: SketchType;
  controlPoints: readonly Cartesian3[];
}

export function createGeometry({
  type,
  controlPoints,
}: GeometryOptions): LineString | Polygon | MultiPolygon | Point | undefined {
  switch (type) {
    case "marker":
      return createPoint(controlPoints);
    case "polyline":
      return createPolyline(controlPoints);
    case "circle":
    case "extrudedCircle":
      return createCircle(controlPoints);
    case "rectangle":
    case "extrudedRectangle":
      return createRectangle(controlPoints);
    case "polygon":
    case "extrudedPolygon":
      return createPolygon(controlPoints);
    default:
      return;
  }
}
