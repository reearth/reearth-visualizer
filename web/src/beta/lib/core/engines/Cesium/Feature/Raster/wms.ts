import { WebMapServiceImageryProvider } from "cesium";
import { useMemo } from "react";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";

export const useWMS = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers, parameters } = useData(layer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "wms") return;
    return new WebMapServiceImageryProvider({
      url,
      layers,
      minimumLevel,
      maximumLevel,
      credit,
      parameters,
    });
  }, [isVisible, show, url, layers, type, minimumLevel, maximumLevel, credit, parameters]);

  useImageryProvider(imageryProvider, layer?.id, property);
};
