import * as Cesium from "cesium";
import { Math as CesiumMath } from "cesium";
import { useImperativeHandle, Ref, RefObject, useMemo, useRef } from "react";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";

import builtinPrimitives from "./builtin";
import Cluster from "./Cluster";
import { getLocationFromScreenXY, flyTo, lookAt, getCamera } from "./common";

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Cesium.Viewer>>,
): EngineRef {
  const cancelCameraFlight = useRef<() => void>();
  const e = useMemo((): EngineRef => {
    return {
      name: "cesium",
      requestRender: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.scene?.requestRender();
      },
      getCamera: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        return getCamera(viewer);
      },
      getLocationFromScreenXY: (x, y) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        return getLocationFromScreenXY(viewer.scene, x, y);
      },
      flyTo: (camera, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        cancelCameraFlight.current?.();
        cancelCameraFlight.current = flyTo(
          viewer.scene?.camera,
          { ...getCamera(viewer), ...camera },
          options,
        );
      },
      lookAt: (camera, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        cancelCameraFlight.current?.();
        cancelCameraFlight.current = lookAt(
          viewer.scene?.camera,
          { ...getCamera(viewer), ...camera },
          options,
        );
      },
      getViewport: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const rect = viewer.camera.computeViewRectangle();
        return rect
          ? {
              north: CesiumMath.toDegrees(rect.north),
              south: CesiumMath.toDegrees(rect.south),
              west: CesiumMath.toDegrees(rect.west),
              east: CesiumMath.toDegrees(rect.east),
            }
          : undefined;
      },
      zoomIn: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.scene?.camera.zoomIn(amount);
      },
      zoomOut: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer?.scene?.camera.zoomOut(amount);
      },
      changeSceneMode: (sceneMode, duration = 2) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene) return;
        switch (sceneMode) {
          case "2d":
            viewer?.scene?.morphTo2D(duration);
            break;
          case "columbus":
            viewer?.scene?.morphToColumbusView(duration);
            break;
          case "3d":
          default:
            viewer?.scene?.morphTo3D(duration);
            break;
        }
      },
      builtinPrimitives,
      clusterComponent: Cluster,
    };
  }, [cesium]);

  useImperativeHandle(ref, () => e, [e]);

  return e;
}
