import {
  Axis,
  Cartesian2,
  Cartesian3,
  HeadingPitchRoll,
  Matrix3,
  Matrix4,
  Quaternion,
  Ray,
  Scene,
  Transforms,
  TranslationRotationScale,
} from "cesium";

import type { Geometry } from "@reearth/core/mantle";

import { translationWithClamping } from "../../utils";

import type { Property } from ".";

export const updateTrs = (
  trs: TranslationRotationScale,
  property: Property | undefined,
  terrainHeightEstimation: number,
  geometry?: Geometry,
  allowEnterGround?: boolean,
) => {
  const { height, width, length, heading, pitch, roll } = property ?? {};

  const coordinates =
    geometry?.type === "Point"
      ? geometry.coordinates
      : property?.location
      ? [property.location.lng, property.location.lat, property.location.height ?? 0]
      : undefined;

  const translation = coordinates
    ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
    : undefined;
  if (translation) {
    Cartesian3.clone(translation, trs.translation);
  }
  if (!allowEnterGround) {
    translationWithClamping(trs, !!allowEnterGround, terrainHeightEstimation);
  }

  const rotation =
    heading && pitch && roll
      ? Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(heading, pitch, roll))
      : Matrix3.getRotation(
          Matrix4.getMatrix3(Transforms.eastNorthUpToFixedFrame(trs.translation), new Matrix3()),
          new Matrix3(),
        );
  Quaternion.clone(Quaternion.fromRotationMatrix(rotation), trs.rotation);

  Cartesian3.clone(new Cartesian3(width || 100, length || 100, height || 100), trs.scale);

  return trs;
};

function screenProjectVector(
  scene: Scene,
  position: Cartesian3,
  direction: Cartesian3,
  length: number,
  result: Cartesian2,
): Cartesian2 {
  const ray = new Ray();
  ray.origin = position;
  ray.direction = direction;
  const nearPoint2d = scene.cartesianToCanvasCoordinates(Ray.getPoint(ray, 0), new Cartesian2());

  const farPoint2d = scene.cartesianToCanvasCoordinates(
    Ray.getPoint(ray, length),
    new Cartesian2(),
  );
  const screenVector2d = Cartesian2.subtract(farPoint2d, nearPoint2d, result);
  return screenVector2d;
}

const dotMousePosition = (
  scene: Scene,
  mouseMove: {
    startPosition: Cartesian2;
    endPosition: Cartesian2;
  },
  position: Cartesian3,
  direction: Cartesian3,
) => {
  const mouseVector2d = Cartesian2.subtract(
    mouseMove.endPosition,
    mouseMove.startPosition,
    new Cartesian2(),
  );

  // Project the vector of unit length to the screen
  const screenVector2d = screenProjectVector(scene, position, direction, 1, new Cartesian2());
  const screenNormal2d = Cartesian2.normalize(screenVector2d, new Cartesian2());

  const pixelsPerStep = Cartesian2.magnitude(screenVector2d);
  const moveAmountPixels = Cartesian2.dot(mouseVector2d, screenNormal2d);

  return {
    pixelsPerStep,
    moveAmount: moveAmountPixels / pixelsPerStep,
  };
};

export const computeMouseMoveAmount = (
  scene: Scene,
  mouseMove: {
    startPosition: Cartesian2;
    endPosition: Cartesian2;
  },
  position: Cartesian3,
  direction: Cartesian3,
  length: number,
) => {
  const { moveAmount, pixelsPerStep } = dotMousePosition(scene, mouseMove, position, direction);
  const scaleAmount = moveAmount / length;
  const pixelLengthAfterScaling = pixelsPerStep * length + pixelsPerStep * length * scaleAmount;
  return { pixelLengthAfterScaling, scaleAmount };
};

// ref: https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L1446-L1461
export function setPlaneDimensions(
  boxDimensions: Cartesian3,
  planeNormalAxis: Axis,
  planeDimensions: Cartesian2,
) {
  if (planeNormalAxis === Axis.X) {
    planeDimensions.x = boxDimensions.y;
    planeDimensions.y = boxDimensions.z;
  } else if (planeNormalAxis === Axis.Y) {
    planeDimensions.x = boxDimensions.x;
    planeDimensions.y = boxDimensions.z;
  } else if (planeNormalAxis === Axis.Z) {
    planeDimensions.x = boxDimensions.x;
    planeDimensions.y = boxDimensions.y;
  }
}
