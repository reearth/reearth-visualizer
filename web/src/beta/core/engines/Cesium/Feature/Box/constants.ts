// The 6 box sides defined as planes in local coordinate space.

import { Cartesian3, Plane as CesiumPlane } from "cesium";

import type { EdgeProperties } from "./Edge";

// ref: https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L161-L169
export const SIDE_PLANES: readonly CesiumPlane[] = [
  new CesiumPlane(new Cartesian3(0, 0, 1), 0.5),
  new CesiumPlane(new Cartesian3(0, 0, -1), 0.5),
  new CesiumPlane(new Cartesian3(0, 1, 0), 0.5),
  new CesiumPlane(new Cartesian3(0, -1, 0), 0.5),
  new CesiumPlane(new Cartesian3(1, 0, 0), 0.5),
  new CesiumPlane(new Cartesian3(-1, 0, 0), 0.5),
];

const CORNER_POINT_VECTORS = [
  new Cartesian3(0.5, 0.5, 0.5),
  new Cartesian3(0.5, -0.5, 0.5),
  new Cartesian3(-0.5, -0.5, 0.5),
  new Cartesian3(-0.5, 0.5, 0.5),
];

const FACE_POINT_VECTORS = [
  new Cartesian3(0.5, 0.0, 0.0),
  new Cartesian3(0.0, 0.5, 0.0),
  new Cartesian3(0.0, 0.0, 0.5),
];

// The box has 8 corner points and 6 face points that act as scaling grips.
// Here we represent them as 7 vectors in local coordinates space.
// Each vector represents a point and its opposite points can be easily derived from it.
// @see https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L184-L187
const SCALE_POINT_VECTORS = [...CORNER_POINT_VECTORS, ...FACE_POINT_VECTORS];

export const SCALE_POINTS = SCALE_POINT_VECTORS.map(vector => {
  return {
    point: vector,
    oppositePoint: Cartesian3.multiplyByScalar(vector, -1, new Cartesian3()),
  };
});

// Calculate edge of box. The box has 12 edge.
// In this logic, calculate 3 edges(vertical edge, top edge, bottom edge) in each `CORNER_POINT_VECTORS`.
export const BOX_EDGES: EdgeProperties[] = CORNER_POINT_VECTORS.flatMap((vector, i) => {
  const upPoint = vector;
  const downPoint = Cartesian3.clone(upPoint, new Cartesian3());
  // Set point to bottom
  downPoint.z *= -1;

  const nextUpPoint = CORNER_POINT_VECTORS[(i + 1) % 4];
  const nextDownPoint = Cartesian3.clone(nextUpPoint, new Cartesian3());
  nextDownPoint.z *= -1;

  const verticalEdge: EdgeProperties = { start: upPoint, end: downPoint, isDraggable: true };
  const topEdge: EdgeProperties = { start: nextUpPoint, end: upPoint };
  const bottomEdge: EdgeProperties = { start: nextDownPoint, end: downPoint };
  return [verticalEdge, topEdge, bottomEdge];
});

// This is used for plane ID.
// We can use this name, for example you want to move the box when front plane is dragged.
export const SIDE_PLANE_NAMES = ["bottom", "top", "front", "back", "left", "right"];
