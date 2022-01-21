import {
  Cartesian3,
  Cartographic,
  Color,
  EllipsoidGeodesic,
  PolylineDashMaterialProperty,
  Math,
  Camera as CesiumCamera,
  Rectangle,
} from "cesium";
import type { Viewer as CesiumViewer } from "cesium";
import { useEffect, useMemo, useState, RefObject } from "react";
import { CesiumComponentRef } from "resium";

import { Camera } from "@reearth/util/value";

import type { SceneProperty } from "..";

import { getCamera } from "./common";

const targetWidth = 1000000;
const targetLength = 1000000;

export function useCameraLimiter(
  cesium: RefObject<CesiumComponentRef<CesiumViewer>>,
  camera: Camera | undefined,
  property: SceneProperty["cameraLimiter"] | undefined,
) {
  const geodesic = useMemo(():
    | undefined
    | { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic } => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return undefined;
    return property?.cameraLimitterTargetArea?.lng && property.cameraLimitterTargetArea.lat
      ? getGeodesic(
          viewer,
          property.cameraLimitterTargetArea.lng,
          property.cameraLimitterTargetArea.lat,
        )
      : undefined;
  }, [cesium, property?.cameraLimitterTargetArea?.lng, property?.cameraLimitterTargetArea?.lat]);

  // calculate inner limiter dimensions
  const limiterDimensions = useMemo((): InnerLimiterDimensions | undefined => {
    if (!geodesic) return undefined;

    const width =
      typeof property?.cameraLimitterTargetWidth === "number"
        ? property.cameraLimitterTargetWidth
        : targetWidth;
    const length =
      typeof property?.cameraLimitterTargetLength === "number"
        ? property.cameraLimitterTargetLength
        : targetLength;

    const { cartesianArray, cartographicDimensions } = calcBoundaryBox(
      geodesic,
      length / 2,
      width / 2,
    );

    return {
      cartographicDimensions,
      cartesianArray,
    };
  }, [property?.cameraLimitterTargetWidth, property?.cameraLimitterTargetLength, geodesic]);

  // calculate maximum camera view (outer boundaries)
  const [cameraViewOuterBoundaries, setCameraViewOuterBoundaries] = useState<
    Cartesian3[] | undefined
  >();

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !property?.cameraLimitterTargetArea || !geodesic) return;

    const camera = new CesiumCamera(viewer.scene);
    camera.setView({
      destination: Cartesian3.fromDegrees(
        property.cameraLimitterTargetArea.lng,
        property.cameraLimitterTargetArea.lat,
        property.cameraLimitterTargetArea.height,
      ),
      orientation: {
        heading: property?.cameraLimitterTargetArea.heading,
        pitch: property?.cameraLimitterTargetArea.pitch,
        roll: property?.cameraLimitterTargetArea.roll,
        up: camera.up,
      },
    });

    const computedViewRectangle = camera.computeViewRectangle();
    if (!computedViewRectangle) return;
    const rectangleHalfWidth = Rectangle.computeWidth(computedViewRectangle) * Math.PI * 1000000;
    const rectangleHalfHeight = Rectangle.computeHeight(computedViewRectangle) * Math.PI * 1000000;

    const {
      cameraLimitterTargetWidth: width = targetWidth,
      cameraLimitterTargetLength: length = targetLength,
    } = property ?? {};

    const { cartesianArray } = calcBoundaryBox(
      geodesic,
      length / 2 + rectangleHalfHeight,
      width / 2 + rectangleHalfWidth,
    );

    setCameraViewOuterBoundaries(cartesianArray);
  }, [cesium, property, geodesic]);

  // Manage camera limiter conditions
  useEffect(() => {
    const viewer = cesium?.current?.cesiumElement;
    const camera = getCamera(cesium?.current?.cesiumElement);
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !camera ||
      !property?.cameraLimitterEnabled ||
      !limiterDimensions
    )
      return;
    viewer.camera.setView({
      destination: getAllowedCameraDestination(camera, limiterDimensions),
      orientation: {
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
        roll: viewer.camera.roll,
        up: viewer.camera.up,
      },
    });
  }, [camera, cesium, property, limiterDimensions]);

  return {
    limiterDimensions,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
  };
}

export const cameraViewBoundariesMaterial = new PolylineDashMaterialProperty({
  color: Color.RED,
});

export type InnerLimiterDimensions = {
  cartographicDimensions: {
    rightDimension: Cartographic;
    leftDimension: Cartographic;
    topDimension: Cartographic;
    bottomDimension: Cartographic;
  };
  cartesianArray: Cartesian3[];
};

export const getGeodesic = (
  viewer: CesiumViewer,
  lng: number,
  lat: number,
): { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic } | undefined => {
  const ellipsoid = viewer.scene.globe.ellipsoid;

  const centerPoint = Cartesian3.fromDegrees(lng, lat, 0);

  const cartographicCenterPoint = Cartographic.fromCartesian(centerPoint);
  const normal = ellipsoid.geodeticSurfaceNormal(centerPoint);
  const east = Cartesian3.normalize(
    Cartesian3.cross(Cartesian3.UNIT_Z, normal, new Cartesian3()),
    new Cartesian3(),
  );
  const north = Cartesian3.normalize(
    Cartesian3.cross(normal, east, new Cartesian3()),
    new Cartesian3(),
  );

  const geodesicVertical = new EllipsoidGeodesic(
    cartographicCenterPoint,
    Cartographic.fromCartesian(north),
    ellipsoid,
  );
  const geodesicHorizontal = new EllipsoidGeodesic(
    cartographicCenterPoint,
    Cartographic.fromCartesian(east),
    ellipsoid,
  );
  return { geodesicVertical, geodesicHorizontal };
};

export const calcBoundaryBox = (
  geodesic: { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic },
  halfLength: number,
  halfWidth: number,
): {
  cartographicDimensions: {
    rightDimension: Cartographic;
    leftDimension: Cartographic;
    topDimension: Cartographic;
    bottomDimension: Cartographic;
  };
  cartesianArray: Cartesian3[];
} => {
  const topDimension = geodesic.geodesicVertical.interpolateUsingSurfaceDistance(halfLength);
  const bottomDimension = geodesic.geodesicVertical.interpolateUsingSurfaceDistance(-halfLength);
  const rightDimension = geodesic.geodesicHorizontal.interpolateUsingSurfaceDistance(halfWidth);
  const leftDimension = geodesic.geodesicHorizontal.interpolateUsingSurfaceDistance(-halfWidth);

  const rightTop = new Cartographic(rightDimension.longitude, topDimension.latitude, 0);
  const leftTop = new Cartographic(leftDimension.longitude, topDimension.latitude, 0);
  const rightBottom = new Cartographic(rightDimension.longitude, bottomDimension.latitude, 0);
  const leftBottom = new Cartographic(leftDimension.longitude, bottomDimension.latitude, 0);
  return {
    cartographicDimensions: {
      rightDimension,
      leftDimension,
      topDimension,
      bottomDimension,
    },
    cartesianArray: [
      Cartographic.toCartesian(rightTop),
      Cartographic.toCartesian(leftTop),
      Cartographic.toCartesian(leftBottom),
      Cartographic.toCartesian(rightBottom),
      Cartographic.toCartesian(rightTop),
    ],
  };
};

export const getAllowedCameraDestination = (
  camera: Camera,
  limiterDimensions: InnerLimiterDimensions,
): Cartesian3 => {
  const cameraPosition = Cartographic.fromDegrees(camera?.lng, camera?.lat, camera?.height);

  const destination = new Cartographic(
    Math.clamp(
      cameraPosition.longitude,
      limiterDimensions.cartographicDimensions.leftDimension.longitude,
      limiterDimensions.cartographicDimensions.rightDimension.longitude,
    ),
    Math.clamp(
      cameraPosition.latitude,
      limiterDimensions.cartographicDimensions.bottomDimension.latitude,
      limiterDimensions.cartographicDimensions.topDimension.latitude,
    ),
    cameraPosition.height,
  );
  return Cartographic.toCartesian(destination);
};
