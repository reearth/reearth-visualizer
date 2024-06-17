import { useCallback, useState } from "react";

import { AreaSize } from "@reearth/beta/ui/layout";

export default () => {
  const [visualizerSize, setVisualizerSize] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const handleVisuzlierResize = useCallback((size: AreaSize) => {
    setVisualizerSize({
      left: size.left + 1,
      top: size.top + 1,
      width: size.width,
      height: size.height,
    });
  }, []);

  return {
    visualizerSize,
    handleVisuzlierResize,
  };
};
