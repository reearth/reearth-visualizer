import { useCallback, useRef, useState } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";
import { Camera } from "@reearth/beta/utils/value";
import { FlyTo, MapRef } from "@reearth/core";

export default () => {
  const visualizerRef = useRef<MapRef | null>(null);

  const [isVisualizerReady, setIsVisualizerReady] = useState<boolean>(false);

  const handleIsVisualizerUpdate = useCallback(
    (value: boolean) => setIsVisualizerReady(value),
    [setIsVisualizerReady],
  );

  // Visualizer Size
  const [visualizerSize, setVisualizerSize] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const handleVisuzlierResize = useCallback((size: AreaSize) => {
    setVisualizerSize({
      left: size.left + 1,
      top: size.top + 1,
      width: size.width,
      height: size.height,
    });
  }, []);

  // Camera
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>(undefined);

  const handleCameraUpdate = useCallback(
    (camera: Camera) => setCurrentCamera(camera),
    [setCurrentCamera],
  );

  const handleFlyTo: FlyTo = useCallback(
    (target, options) => {
      if (!isVisualizerReady) return;
      visualizerRef.current?.engine.flyTo(target, options);
    },
    [isVisualizerReady],
  );

  return {
    visualizerRef,
    isVisualizerReady,
    handleIsVisualizerUpdate,
    visualizerSize,
    handleVisuzlierResize,
    currentCamera,
    handleCameraUpdate,
    handleFlyTo,
  };
};
