import useTransition, { TransitionStatus } from "@rot1024/use-transition";
import { Math as CesiumMath, EasingFunction } from "cesium";
import { useCallback, useEffect, useRef } from "react";

import { useDelayedCount, Durations } from "@reearth/util/use-delayed-count";
import { Camera } from "@reearth/util/value";

import { useContext } from "../../../Plugin";

export type { TransitionStatus } from "@rot1024/use-transition";

const cameraDuration = 2;
const cameraExitDuration = 2;
const fovDuration = 0.5;
const fovExitDuration = 0.5;
export const photoDuration = 1;
export const photoExitDuration = 0.5;
const defaultFOV = CesiumMath.toRadians(60);

const durations: Durations = [
  [cameraDuration * 1000, cameraExitDuration * 1000],
  [fovDuration * 1000, fovExitDuration * 1000],
  [photoDuration * 1000, photoExitDuration * 1000],
];

export default function ({ isSelected, camera }: { isSelected?: boolean; camera?: Camera }): {
  photoOverlayImageTransiton: TransitionStatus;
  exitPhotoOverlay: () => void;
} {
  const ctx = useContext();
  const flyTo = ctx?.reearth.visualizer.camera.flyTo;
  const getCamera = useCallback(
    () => ctx?.reearth.visualizer.camera.position,
    [ctx?.reearth.visualizer],
  );

  // mode 0 = idle, 1 = idle<->fly, 2 = fly<->fov, 3 = fov<->photo, 4 = photo
  const [mode, prevMode, startTransition] = useDelayedCount(durations);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const storytelling = useRef(false);
  storytelling.current = ctx?.reearth.layers.selectionReason === "storytelling";
  const prevCamera = useRef<Camera>();

  // camera flight
  useEffect(() => {
    if ((prevMode ?? 0) > 1 && mode === 1 && prevCamera.current) {
      flyTo?.(prevCamera.current, {
        duration: cameraExitDuration,
        easing: EasingFunction.CUBIC_IN_OUT,
      });
      prevCamera.current = undefined;
    } else if ((prevMode ?? 0) === 0 && mode === 1 && cameraRef.current) {
      prevCamera.current = getCamera?.();
      flyTo?.(
        { ...cameraRef.current, fov: prevCamera.current?.fov },
        {
          duration: cameraDuration,
          easing: EasingFunction.CUBIC_IN_OUT,
        },
      );
    } else if (mode === 2) {
      const fov =
        (prevMode ?? 0) === 1 ? cameraRef.current?.fov : prevCamera.current?.fov ?? defaultFOV;
      flyTo?.(
        { fov },
        {
          duration: (prevMode ?? 0) === 1 ? fovDuration : fovExitDuration,
          easing: EasingFunction.CUBIC_IN_OUT,
        },
      );
    }
  }, [flyTo, getCamera, mode, prevMode]);

  // start transition: when selection was changed
  useEffect(() => {
    // restore fov
    if (!isSelected && storytelling.current) {
      const fov = prevCamera.current?.fov ?? defaultFOV;
      flyTo?.({ fov }, { duration: 0 });
    }
    // skip camera flight when is not selected
    startTransition(!isSelected, !isSelected);
  }, [flyTo, startTransition, isSelected]);

  const transition = useTransition(
    !!isSelected && mode >= 3,
    (prevMode ?? 0) > 3 ? photoExitDuration * 1000 : photoDuration * 1000,
    {
      mountOnEnter: true,
      unmountOnExit: true,
    },
  );

  const exitPhotoOverlay = useCallback(
    () => startTransition(true, !camera),
    [camera, startTransition],
  );

  return {
    photoOverlayImageTransiton: transition,
    exitPhotoOverlay,
  };
}
