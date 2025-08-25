import { AreaSize } from "@reearth/app/ui/layout";
import { FlyTo, MapRef } from "@reearth/core";
import { useCallback, useRef, useState } from "react";

import { Tab } from "../../Navbar";
import { useWidgetsViewDevice, usePublishViewDevice } from "../atoms";

export default ({ tab }: { tab: Tab }) => {
  const visualizerRef = useRef<MapRef | null>(null);

  const [isVisualizerReady, setIsVisualizerReady] = useState<boolean>(false);

  const handleIsVisualizerUpdate = useCallback(
    (value: boolean) => setIsVisualizerReady(value),
    [setIsVisualizerReady]
  );

  const [widgetsViewDevice] = useWidgetsViewDevice();
  const [publishViewDevice] = usePublishViewDevice();

  // Visualizer Size
  const [visualizerSize, setVisualizerSize] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0
  });
  const isVisualizerResizing = useRef(false);

  const handleVisualizerResize = useCallback(
    (size: AreaSize) => {
      const device =
        tab === "widgets"
          ? widgetsViewDevice
          : tab === "publish"
            ? publishViewDevice
            : "desktop";

      const deviceSize =
        device === "desktop"
          ? {
              left: size.left + 1,
              top: size.top + 1,
              width: size.width,
              height: size.height
            }
          : {
              left: (size.width - (size.height / 16) * 9) / 2 + size.left + 1,
              top: size.top + 1,
              width: (size.height / 16) * 9,
              height: size.height
            };
      setVisualizerSize(deviceSize);
      isVisualizerResizing.current = true;
      requestAnimationFrame(() => {
        isVisualizerResizing.current = false;
      });
    },
    [widgetsViewDevice, publishViewDevice, tab]
  );

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
