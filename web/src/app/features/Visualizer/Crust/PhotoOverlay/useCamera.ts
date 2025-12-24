import { areCamerasCloseEnoughCustomTolerance } from "@reearth/app/utils/camera";
import { PhotoOverlayValue } from "@reearth/app/utils/sketch";
import { Camera, MapRef } from "@reearth/core";
import { RefObject, useCallback, useEffect, useRef } from "react";

export const DEFAULT_CAMERA_DURATION = 1;
const RECOVER_DURATION = 0.1;

export default ({
  value,
  isPreview,
  mapRef,
  currentCameraRef,
  cameraDurationRef,
  onFlyEnd
}: {
  value: PhotoOverlayValue | undefined;
  isPreview: boolean;
  mapRef: RefObject<MapRef | null> | undefined;
  currentCameraRef?: RefObject<Camera | undefined | null>;
  cameraDurationRef: RefObject<number | null>;
  onFlyEnd?: () => void;
}) => {
  const lastFOVRef = useRef<number | undefined>(undefined);
  const cameraInFlyRef = useRef<boolean>(false);
  const cameraInFlyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setTimeout(
      () => {
        const targetCamera = value?.camera;

        if (isPreview) {
          onFlyEnd?.();
          if (!targetCamera) return;
          mapRef?.current?.engine?.flyTo(targetCamera, { duration: 0 });
          return;
        }

        if (targetCamera) {
          if (!cameraInFlyRef?.current) {
            lastFOVRef.current = currentCameraRef?.current?.fov;
          }

          mapRef?.current?.engine?.flyTo(targetCamera, {
            duration: cameraDurationRef.current ?? DEFAULT_CAMERA_DURATION
          });

          if (cameraInFlyTimeoutRef.current) {
            clearTimeout(cameraInFlyTimeoutRef.current);
          }
          cameraInFlyRef.current = true;
          cameraInFlyTimeoutRef.current = setTimeout(
            () => {
              cameraInFlyRef.current = false;
            },
            (cameraDurationRef.current ?? DEFAULT_CAMERA_DURATION) * 1000
          );
        }

        const closeEnough =
          targetCamera && currentCameraRef?.current
            ? areCamerasCloseEnoughCustomTolerance(
                targetCamera,
                currentCameraRef.current
              )
            : false;

        setTimeout(
          () => {
            onFlyEnd?.();
          },
          !targetCamera || closeEnough
            ? 0
            : (cameraDurationRef.current ?? DEFAULT_CAMERA_DURATION) * 1000
        );
      },
      // wait for the recover end
      RECOVER_DURATION * 1000 + 100
    );
  }, [
    isPreview,
    mapRef,
    value?.camera,
    value?.url,
    cameraDurationRef,
    currentCameraRef,
    onFlyEnd
  ]);

  const recoverFov = useCallback(() => {
    if (lastFOVRef.current && currentCameraRef?.current) {
      mapRef?.current?.engine?.flyTo(
        { ...currentCameraRef.current, fov: lastFOVRef.current },
        {
          duration: RECOVER_DURATION
        }
      );
    }
  }, [mapRef, currentCameraRef]);

  useEffect(() => {
    if (!value) {
      recoverFov();
    }
  }, [value, recoverFov]);

  return null;
};
