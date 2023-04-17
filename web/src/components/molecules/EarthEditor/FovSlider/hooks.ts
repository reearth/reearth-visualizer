import { useCallback } from "react";

import { Camera } from "@reearth/util/value";

type Params = {
  onIsCapturingChange?: (isCapturing: boolean) => void;
  camera?: Camera;
  onFovChange?: (fov: number) => void;
};

export default ({ onIsCapturingChange, camera, onFovChange }: Params) => {
  const finishCapture = useCallback(() => onIsCapturingChange?.(false), [onIsCapturingChange]);

  const updateFov = useCallback(
    (fov: number) => onFovChange?.(Math.max(0.01, Math.min(fov, Math.PI - 10 ** -10))),
    [onFovChange],
  );

  const isAwayTarget = useCallback((e: Event) => {
    const target = e.target as HTMLElement | null;
    const popups = Array.from(document.querySelectorAll("[data-camera-popup]"));
    return !popups.some(element => element.contains(target));
  }, []);

  const handleClickAway = useCallback(
    (e: Event) => isAwayTarget(e) && finishCapture(),
    [isAwayTarget, finishCapture],
  );

  return { camera, updateFov, handleClickAway };
};
