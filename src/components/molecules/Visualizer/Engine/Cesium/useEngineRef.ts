import { useImperativeHandle, Ref, RefObject, useMemo } from "react";
import { Viewer } from "cesium";
import type { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import { getLocationFromScreenXY, flyTo, lookAt, getCamera } from "./common";
import builtinPrimitives from "./builtin";

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Viewer>>,
): EngineRef {
  const e = useMemo(
    (): EngineRef => ({
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
        flyTo(viewer.scene?.camera, { ...getCamera(viewer), ...camera }, options);
      },
      lookAt: (camera, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        lookAt(viewer.scene?.camera, { ...getCamera(viewer), ...camera }, options);
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
      builtinPrimitives,
    }),
    [cesium],
  );

  useImperativeHandle(ref, () => e, [e]);

  return e;
}
