import {
  CameraPosition as CoreCameraPosition,
  CameraOptions,
  FlyTo
} from "@reearth/core";
import { useCallback, useMemo } from "react";

import { useVisualizerCamera } from "../../../atoms";
import { useGet } from "../../utils";
import {
  CameraEventType,
  CameraMoveOptions,
  CameraPosition,
  LookAtDestination,
  ScreenSpaceCameraControllerOptions
} from "../pluginAPI/types";
import { GeoRect } from "../pluginAPI/types/common";
import { Props } from "../types";
import { events, useEmit } from "../utils/events";

export default ({
  mapRef,
  onCameraForceHorizontalRollChange
}: Pick<Props, "mapRef" | "onCameraForceHorizontalRollChange">) => {
  const engineRef = mapRef?.current?.engine;
  const [camera] = useVisualizerCamera();

  const cameraPosition: CameraPosition | undefined = useMemo(() => {
    if (!camera) return;
    return {
      lat: camera.lat,
      lng: camera.lng,
      height: camera.height,
      heading: camera.heading,
      pitch: camera.pitch,
      roll: camera.roll
    };
  }, [camera]);

  const getCameraPosition = useGet(cameraPosition);

  const getCameraFov = useGet(camera?.fov);
  const getCameraAspectRatio = useGet(camera?.aspectRatio);

  const getCameraViewport = useCallback(
    () => engineRef?.getViewport(),
    [engineRef]
  );

  const zoomIn = useCallback(
    (amount: number) => {
      engineRef?.zoomIn(amount);
    },
    [engineRef]
  );

  const zoomOut = useCallback(
    (amount: number) => {
      engineRef?.zoomOut(amount);
    },
    [engineRef]
  );

  const setView = useCallback(
    (camera: CoreCameraPosition) => {
      engineRef?.setView(camera);
    },
    [engineRef]
  );

  const flyTo: FlyTo = useCallback(
    (target, options) => {
      engineRef?.flyTo(target, options);
    },
    [engineRef]
  );

  const flyToBoundingBox = useCallback(
    (
      bbox: GeoRect,
      options?: CameraMoveOptions & {
        heading?: number;
        pitch?: number;
        range?: number;
      }
    ) => {
      return engineRef?.flyToBBox(
        [bbox.west, bbox.south, bbox.east, bbox.north],
        options
      );
    },
    [engineRef]
  );

  const getGlobeIntersection = useCallback(
    (options: { withTerrain?: boolean; calcViewSize?: boolean }) => {
      return engineRef?.getCameraFovInfo(options);
    },
    [engineRef]
  );

  const enableScreenSpaceCameraController = useCallback(
    (enabled?: boolean) =>
      engineRef?.enableScreenSpaceCameraController(!!enabled),
    [engineRef]
  );

  const overrideScreenSpaceCameraController = useCallback(
    (options?: ScreenSpaceCameraControllerOptions) => {
      return engineRef?.overrideScreenSpaceController(options ?? {});
    },
    [engineRef]
  );

  const lookAt = useCallback(
    (dest: LookAtDestination, options?: CameraOptions) => {
      engineRef?.lookAt(dest, options);
    },
    [engineRef]
  );

  const rotateAround = useCallback(
    (radian: number) => {
      return engineRef?.rotateOnCenter(radian);
    },
    [engineRef]
  );

  const rotateRight = useCallback(
    (radian: number) => {
      engineRef?.rotateRight(radian);
    },
    [engineRef]
  );

  const orbit = useCallback(
    (radian: number) => {
      engineRef?.orbit(radian);
    },
    [engineRef]
  );

  const move = useCallback(
    (
      direction: "forward" | "backward" | "up" | "down" | "left" | "right",
      amount: number
    ) => {
      if (direction === "forward") {
        engineRef?.moveForward(amount);
      } else if (direction === "backward") {
        engineRef?.moveBackward(amount);
      } else if (direction === "up") {
        engineRef?.moveUp(amount);
      } else if (direction === "down") {
        engineRef?.moveDown(amount);
      } else if (direction === "left") {
        engineRef?.moveLeft(amount);
      } else if (direction === "right") {
        engineRef?.moveRight(amount);
      }
    },
    [engineRef]
  );

  const moveOverTerrain = useCallback(
    (offset?: number) => {
      return engineRef?.moveOverTerrain(offset);
    },
    [engineRef]
  );

  const enableForceHorizontalRoll = useCallback(
    (enabled: boolean) => {
      onCameraForceHorizontalRollChange?.(enabled);
    },
    [onCameraForceHorizontalRollChange]
  );

  // events
  const [cameraEvents, emit] = useMemo(() => events<CameraEventType>(), []);

  useEmit<Pick<CameraEventType, "move">>(
    {
      move: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera]
      )
    },
    emit
  );

  const cameraEventsOn = useCallback(
    <T extends keyof CameraEventType>(
      type: T,
      callback: (...args: CameraEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? cameraEvents.once(type, callback)
        : cameraEvents.on(type, callback);
    },
    [cameraEvents]
  );

  const cameraEventsOff = useCallback(
    <T extends keyof CameraEventType>(
      type: T,
      callback: (...args: CameraEventType[T]) => void
    ) => {
      return cameraEvents.off(type, callback);
    },
    [cameraEvents]
  );

  return {
    getCameraPosition,
    getCameraFov,
    getCameraAspectRatio,
    getCameraViewport,
    zoomIn,
    zoomOut,
    setView,
    flyTo,
    flyToBoundingBox,
    getGlobeIntersection,
    enableScreenSpaceCameraController,
    overrideScreenSpaceCameraController,
    lookAt,
    rotateAround,
    rotateRight,
    orbit,
    move,
    moveOverTerrain,
    enableForceHorizontalRoll,
    cameraEventsOn,
    cameraEventsOff,
    cameraEvents
  };
};
