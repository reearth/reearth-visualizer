import { useState, useEffect, useCallback, useRef } from "react";

import type { Camera, FlyToDestination } from "../types";

import { degreeToRadian, radianToDegree } from "./NavigatorPresenter";

export default function ({
  camera,
  initialCamera,
  onZoomIn,
  onZoomOut,
  onCameraOrbit,
  onCameraRotateRight,
  onFlyTo,
}: {
  camera?: Camera;
  initialCamera?: Camera;
  onZoomIn?: (amount: number) => void;
  onZoomOut?: (amount: number) => void;
  onCameraOrbit?: (orbit: number) => void;
  onCameraRotateRight?: (radian: number) => void;
  onFlyTo?: (camera: FlyToDestination, options?: { duration?: number }) => void;
}) {
  const [degree, setDegree] = useState(0);
  const [isHelpOpened, setIsHelpOpened] = useState(false);
  const orbitRadianRef = useRef(0);
  const isMovingOrbit = useRef(false);

  const handleOnRotate = useCallback(
    (deg: number) => {
      const radian = degreeToRadian(deg);
      onCameraRotateRight?.(radian);
    },
    [onCameraRotateRight],
  );
  const handleOnStartOrbit = useCallback(() => {
    isMovingOrbit.current = true;
  }, []);
  const handleOnEndOrbit = useCallback(() => {
    isMovingOrbit.current = false;
  }, []);
  const handleOnMoveOrbit = useCallback((deg: number) => {
    orbitRadianRef.current = degreeToRadian(deg);
  }, []);
  const handleOnRestoreRotate = useCallback(() => {
    if (initialCamera) {
      onFlyTo?.(initialCamera, { duration: 1 });
    }
  }, [initialCamera, onFlyTo]);
  const handleOnClickHelp = useCallback(() => {
    setIsHelpOpened(prev => !prev);
  }, []);

  const handleOnZoomIn = useCallback(() => {
    onZoomIn?.(2);
  }, [onZoomIn]);
  const handleOnZoomOut = useCallback(() => {
    onZoomOut?.(2);
  }, [onZoomOut]);

  const cameraHeading = camera?.heading;
  // Sync cesium camera.
  useEffect(() => {
    if (!cameraHeading) {
      return;
    }
    setDegree(360 - radianToDegree(cameraHeading));
  }, [cameraHeading]);

  useEffect(() => {
    if (!onCameraOrbit) return;

    let a = 0;
    const handleTick = () => {
      a = window.requestAnimationFrame(() => {
        handleTick();
        if (!isMovingOrbit.current) {
          return;
        }
        onCameraOrbit?.(orbitRadianRef.current);
      });
    };
    handleTick();

    return () => window.cancelAnimationFrame(a);
  }, [onCameraOrbit]);

  return {
    degree,
    isHelpOpened,
    events: {
      onRotate: handleOnRotate,
      onStartOrbit: handleOnStartOrbit,
      onEndOrbit: handleOnEndOrbit,
      onMoveOrbit: handleOnMoveOrbit,
      onRestoreRotate: handleOnRestoreRotate,
      onHelp: handleOnClickHelp,
      onZoomIn: handleOnZoomIn,
      onZoomOut: handleOnZoomOut,
    },
  };
}
