import { useCesium } from "resium";
import { useEffect, useState } from "react";

import { Camera, fromCamera } from "./value";
import useTween, { Easing } from "./use-tween";
import { PerspectiveFrustum, Camera as CesiumCamera, EasingFunction } from "cesium";
import { useTimeout } from "react-use";

export const useAnimateCameraFOV = (
  c: CesiumCamera | undefined,
  fov: number | undefined,
  duration = 0,
  delay = 0,
  easing: Easing | ((t: number) => number) = "inOutCubic",
) => {
  const frustum = c?.frustum instanceof PerspectiveFrustum ? c.frustum : undefined;
  const [f, setF] = useState<[number, number]>();
  const v = useTween(easing, duration, f);

  const ready = useTimeout(delay)[0]();

  useEffect(() => {
    if (!f || !frustum || !ready) return;
    frustum.fov = Math.min(Math.PI, Math.max(0, v * (f[0] - f[1]) + f[1]));
  }, [v, f, frustum, ready]);

  useEffect(() => {
    if (ready && frustum && typeof fov === "number" && fov !== frustum.fov) {
      setF([fov, frustum.fov]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, fov, frustum, ready]); // ignore duration
};

export const useFlyTo = (
  camera?: Camera,
  opts?: {
    duration?: number;
    delay?: number;
    easing?: EasingFunction.Callback;
  },
) => {
  const c = useCesium()?.scene?.camera;

  useAnimateCameraFOV(c, camera?.fov, opts?.duration, opts?.delay, opts?.easing);

  const ready = useTimeout(opts?.delay ?? 0)[0]();

  useEffect(() => {
    if (!c || !ready) return;
    const cc = fromCamera(camera);
    if (!cc) return;

    c.flyTo({
      destination: cc.destination,
      orientation: cc.orientation,
      duration: (opts?.duration ?? 0) / 1000,
      easingFunction: opts?.easing,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, camera, ready]); // ignore opts update
};
