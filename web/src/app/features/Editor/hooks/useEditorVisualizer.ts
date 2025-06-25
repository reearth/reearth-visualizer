import { AreaSize } from "@reearth/app/ui/layout";
import { FlyTo, MapRef } from "@reearth/core";
import { useCallback, useRef, useState } from "react";

export default () => {
  const visualizerRef = useRef<MapRef | null>(null);

  const [isVisualizerReady, setIsVisualizerReady] = useState<boolean>(false);

  const handleIsVisualizerUpdate = useCallback(
    (value: boolean) => setIsVisualizerReady(value),
    [setIsVisualizerReady]
  );

  // Visualizer Size
  const [visualizerSize, setVisualizerSize] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0
  });
  const isVisualizerResizing = useRef(false);

  const handleVisualizerResize = useCallback((size: AreaSize) => {
    setVisualizerSize({
      left: size.left + 1,
      top: size.top + 1,
      width: size.width,
      height: size.height
    });
    isVisualizerResizing.current = true;
    requestAnimationFrame(() => {
      isVisualizerResizing.current = false;
    });
  }, []);

  const handleFlyTo: FlyTo = useCallback(
    (target, options) => {
      if (!isVisualizerReady) return;
      visualizerRef.current?.engine.flyTo(target, options);
    },
    [isVisualizerReady]
  );

  return {
    visualizerRef,
    isVisualizerReady,
    handleIsVisualizerUpdate,
    visualizerSize,
    handleVisualizerResize,
    isVisualizerResizing,
    handleFlyTo
  };
};
