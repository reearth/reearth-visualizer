import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import { isEqual } from "lodash-es";

import { Camera } from "@reearth/util/value";
import { flyTo } from "./common";

export type Props = {
  camera?: Camera;
  duration?: number;
  easing?: (time: number) => number;
};

const CameraFlyTo = ({ camera, duration, easing }: Props): null => {
  const { viewer } = useCesium() ?? {};
  const prev = useRef<Camera>();

  useEffect(() => {
    if (!viewer || !camera || isEqual(camera, prev.current)) return;
    prev.current = { ...camera };
    flyTo(viewer.camera, camera, { duration, easing });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, camera]); // ignore duration and easing

  return null;
};

export default CameraFlyTo;
