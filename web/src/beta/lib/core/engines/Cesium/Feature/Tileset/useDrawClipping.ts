// Draw clipping allows user clip 3dtiles with a polygon and top/bottom.

import * as turf from "@turf/turf";
import {
  Cartesian3,
  Cesium3DTileset,
  ClippingPlane,
  ClippingPlaneCollection,
  Matrix4,
  Plane,
  Transforms,
  Viewer,
} from "cesium";
import { MutableRefObject, useEffect, useMemo, useState } from "react";

import { LatLng } from "../../..";
import { sampleTerrainHeight } from "../../common";

import { ClippingPolygonStyle } from "./DrawClippingPolygon";

type drawClippingProps = {
  enabled?: boolean;
  surfacePoints?: LatLng[];
  direction?: "inside" | "outside";
  top?: number;
  bottom?: number;
  visible?: boolean;
  style?: ClippingPolygonStyle;
  tilesetRef?: MutableRefObject<Cesium3DTileset | undefined>;
  viewer?: Viewer;
  clippingPlanes: ClippingPlaneCollection;
};

export const useDrawClipping = ({
  enabled,
  surfacePoints,
  direction = "inside",
  top,
  bottom,
  visible = true,
  style,
  tilesetRef,
  viewer,
  clippingPlanes,
}: drawClippingProps) => {
  const [baseHeight, setBaseHeight] = useState(0);
  const appliedTop = useMemo(() => top ?? 100, [top]);
  const appliedBottom = useMemo(() => bottom ?? 10, [bottom]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const updateClippingPlanes = async () => {
      if (!tilesetRef?.current) return;

      try {
        await tilesetRef.current.readyPromise;
      } catch (e) {
        console.error("Could not load 3D tiles: ", e);
        return;
      }

      if (!enabled || !surfacePoints || surfacePoints?.length < 2) {
        clippingPlanes.removeAll();
        setBaseHeight(0);
        return;
      }

      clippingPlanes.modelMatrix = Matrix4.IDENTITY.clone();

      setReady(false);
      const polygon = turf.polygon([surfacePoints.map(p => [p.lng, p.lat])]);
      const center = turf.centroid(polygon);
      const baseHeight = viewer?.scene
        ? (await sampleTerrainHeight(
            viewer?.scene,
            center.geometry.coordinates[0],
            center.geometry.coordinates[1],
          )) ?? 0
        : 0;
      setBaseHeight(baseHeight);

      const inverseTransform = Matrix4.inverse(
        Transforms.eastNorthUpToFixedFrame(tilesetRef.current.boundingSphere.center),
        new Matrix4(),
      );

      // making points count-clockwise
      let sum = 0;
      for (let i = 0; i < surfacePoints.length; i++) {
        const p1 = surfacePoints[i];
        const p2 = surfacePoints[(i + 1) % surfacePoints.length];
        sum += (p2.lng - p1.lng) * (p2.lat + p1.lat);
      }
      if (sum > 0) {
        surfacePoints.reverse();
      }

      clippingPlanes.removeAll();

      // side planes
      for (let i = 0; i < surfacePoints.length - 1; i++) {
        const p1 = surfacePoints[i];
        const p2 = surfacePoints[i + 1];
        clippingPlanes.add(createSidePlane(p1, p2, inverseTransform, direction));
      }

      // top & bottom planes
      clippingPlanes.add(
        createHorizontalPlane(
          surfacePoints[0],
          baseHeight + appliedTop,
          inverseTransform,
          direction === "inside" ? 1 : -1,
        ),
      );
      clippingPlanes.add(
        createHorizontalPlane(
          surfacePoints[0],
          baseHeight - appliedBottom,
          inverseTransform,
          direction === "inside" ? -1 : 1,
        ),
      );

      setReady(true);
    };

    updateClippingPlanes();
  }, [
    surfacePoints,
    tilesetRef,
    clippingPlanes,
    appliedTop,
    appliedBottom,
    enabled,
    direction,
    viewer,
  ]);

  useEffect(() => {
    clippingPlanes.unionClippingRegions = direction === "outside";
  }, [clippingPlanes, direction, enabled]);

  const drawClippingEdgeProps = useMemo(
    () => ({
      coordiantes: surfacePoints?.map(p => [p.lng, p.lat]) ?? [],
      top: baseHeight + appliedTop,
      bottom: baseHeight - appliedBottom,
      visible,
      style,
      ready,
    }),
    [surfacePoints, baseHeight, appliedTop, appliedBottom, visible, style, ready],
  );

  return {
    drawClippingEnabled: enabled,
    drawClippingEdgeProps,
  };
};

const getOriginCoordinateSystemPoint = (
  point: LatLng,
  inverseTransform: Matrix4,
  height?: number,
) => {
  const pos = Cartesian3.fromDegrees(point.lng, point.lat, height);
  return Matrix4.multiplyByPoint(inverseTransform, pos, new Cartesian3());
};

const createSidePlane = (
  p1: LatLng,
  p2: LatLng,
  inverseTransform: Matrix4,
  direction: "inside" | "outside",
) => {
  const p1C3 = getOriginCoordinateSystemPoint(p1, inverseTransform);
  const p2C3 = getOriginCoordinateSystemPoint(p2, inverseTransform);
  const up = new Cartesian3(0, 0, 1);
  const down = new Cartesian3(0, 0, -1);
  const right = Cartesian3.subtract(p2C3, p1C3, new Cartesian3());
  const normal =
    direction === "inside"
      ? Cartesian3.normalize(Cartesian3.cross(right, up, new Cartesian3()), new Cartesian3())
      : Cartesian3.normalize(Cartesian3.cross(right, down, new Cartesian3()), new Cartesian3());
  const plane = Plane.fromPointNormal(p1C3, normal);
  return ClippingPlane.fromPlane(plane);
};

const createHorizontalPlane = (
  point: LatLng,
  height: number,
  inverseTransform: Matrix4,
  direction: number,
) => {
  const pC3 = getOriginCoordinateSystemPoint(point, inverseTransform, height);
  const normal = new Cartesian3(0, 0, direction);
  const plane = Plane.fromPointNormal(pC3, normal);
  return ClippingPlane.fromPlane(plane);
};
