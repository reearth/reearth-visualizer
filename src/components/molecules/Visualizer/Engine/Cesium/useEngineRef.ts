import * as Cesium from "cesium";
import { Math as CesiumMath } from "cesium";
import { useImperativeHandle, Ref, RefObject, useMemo, useRef } from "react";
import { CesiumComponentRef } from "resium";

import type { Ref as EngineRef } from "..";
import type { MouseEvents, MouseEvent } from "../ref";

import builtinPrimitives from "./builtin";
import Cluster from "./Cluster";
import {
  getLocationFromScreenXY,
  flyTo,
  lookAt,
  getCamera,
  getClock,
  lookHorizontal,
  lookVertical,
  moveForward,
  moveBackward,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  moveOverTerrain,
  flyToGround,
  getCenterCamera,
  zoom,
} from "./common";

export default function useEngineRef(
  ref: Ref<EngineRef>,
  cesium: RefObject<CesiumComponentRef<Cesium.Viewer>>,
): EngineRef {
  const cancelCameraFlight = useRef<() => void>();
  const mouseEventCallbacks = useRef<MouseEvents>({
    click: undefined,
    doubleclick: undefined,
    mousedown: undefined,
    mouseup: undefined,
    rightclick: undefined,
    rightdown: undefined,
    rightup: undefined,
    middleclick: undefined,
    middledown: undefined,
    middleup: undefined,
    mousemove: undefined,
    mouseenter: undefined,
    mouseleave: undefined,
    wheel: undefined,
  });
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
      lookAtLayer: layerId => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const e = viewer.entities.getById(layerId);
        if (!e) return;
        const entityPos = e.position?.getValue(viewer.clock.currentTime);
        if (!entityPos) return;
        const cameraPos = viewer.camera.positionWC;
        const distance = Cesium.Cartesian3.distance(entityPos, cameraPos);
        if (Math.round(distance * 1000) / 1000 === 5000) return;
        const camera = getCamera(viewer);
        const offset = new Cesium.HeadingPitchRange(
          camera?.heading ?? 0,
          camera?.pitch ?? -90,
          5000,
        );
        viewer.zoomTo(e, offset);
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
      zoomIn: (amount, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const scene = viewer.scene;
        const camera = scene.camera;
        zoom({ camera, scene, relativeAmount: 1 / amount }, options);
      },
      zoomOut: (amount, options) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const scene = viewer.scene;
        const camera = scene.camera;
        zoom({ camera, scene, relativeAmount: amount }, options);
      },
      orbit: radian => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const scene = viewer.scene;
        const camera = scene.camera;

        const distance = 0.02;
        const angle = radian + CesiumMath.PI_OVER_TWO;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const oldTransform = Cesium.Matrix4.clone(camera.transform);

        const center = getCenterCamera({ camera, scene });
        // Get fixed frame from center to globe ellipsoid.
        const frame = Cesium.Transforms.eastNorthUpToFixedFrame(
          center || camera.positionWC,
          scene.globe.ellipsoid,
        );

        camera.lookAtTransform(frame);

        if (center) {
          camera.rotateLeft(x);
          camera.rotateUp(y);
        } else {
          camera.look(Cesium.Cartesian3.UNIT_Z, x);
          camera.look(camera.right, y);
        }
        camera.lookAtTransform(oldTransform);
      },
      rotateRight: radian => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        const scene = viewer.scene;
        const camera = scene.camera;
        const oldTransform = Cesium.Matrix4.clone(camera.transform);
        const frame = Cesium.Transforms.eastNorthUpToFixedFrame(
          camera.positionWC,
          scene.globe.ellipsoid,
        );
        camera.lookAtTransform(frame);
        camera.rotateRight(radian - -camera.heading);
        camera.lookAtTransform(oldTransform);
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
      getClock: () => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.clock) return;
        const clock: Cesium.Clock = viewer.clock;
        return getClock(clock);
      },
      captureScreen: (type?: string, encoderOptions?: number) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        viewer.render();
        return viewer.canvas.toDataURL(type, encoderOptions);
      },
      enableScreenSpaceCameraController: (enabled = true) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene) return;
        const enable = !!enabled;
        viewer.scene.screenSpaceCameraController.enableRotate = enable;
        viewer.scene.screenSpaceCameraController.enableTranslate = enable;
        viewer.scene.screenSpaceCameraController.enableZoom = enable;
        viewer.scene.screenSpaceCameraController.enableTilt = enable;
        viewer.scene.screenSpaceCameraController.enableLook = enable;
      },
      lookHorizontal: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        lookHorizontal(viewer.scene, amount);
      },
      lookVertical: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        lookVertical(viewer.scene, amount);
      },
      moveForward: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        moveForward(viewer.scene, amount);
      },
      moveBackward: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        moveBackward(viewer.scene, amount);
      },
      moveUp: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        moveUp(viewer.scene, amount);
      },
      moveDown: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        moveDown(viewer.scene, amount);
      },
      moveLeft: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        moveLeft(viewer.scene, amount);
      },
      moveRight: amount => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed() || !viewer.scene || !amount) return;
        moveRight(viewer.scene, amount);
      },
      moveOverTerrain: async offset => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        moveOverTerrain(viewer, offset);
      },
      flyToGround: async (camera, options, offset) => {
        const viewer = cesium.current?.cesiumElement;
        if (!viewer || viewer.isDestroyed()) return;
        flyToGround(viewer, cancelCameraFlight, camera, options, offset);
      },
      onClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.click = cb;
      },
      onDoubleClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.doubleclick = cb;
      },
      onMouseDown: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mousedown = cb;
      },
      onMouseUp: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mouseup = cb;
      },
      onRightClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.rightclick = cb;
      },
      onRightDown: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.rightdown = cb;
      },
      onRightUp: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.rightup = cb;
      },
      onMiddleClick: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.middleclick = cb;
      },
      onMiddleDown: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.middledown = cb;
      },
      onMiddleUp: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.middleup = cb;
      },
      onMouseMove: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mousemove = cb;
      },
      onMouseEnter: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mouseenter = cb;
      },
      onMouseLeave: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.mouseleave = cb;
      },
      onWheel: (cb: ((props: MouseEvent) => void) | undefined) => {
        mouseEventCallbacks.current.wheel = cb;
      },
      mouseEventCallbacks: mouseEventCallbacks.current,
      builtinPrimitives,
      clusterComponent: Cluster,
    };
  }, [cesium]);

  useImperativeHandle(ref, () => e, [e]);

  return e;
}
