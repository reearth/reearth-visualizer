import { UrlTemplateImageryProvider } from "cesium";
import { useMemo } from "react";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";
import { normalizeUrl } from "./utils";

export const useTiles = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url } = useData(layer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || type !== "tiles") return;
    return new UrlTemplateImageryProvider({
      url: normalizeUrl(url, "png"),
      minimumLevel,
      maximumLevel,
      credit,
    });
  }, [isVisible, show, url, type, minimumLevel, maximumLevel, credit]);

  useImageryProvider(imageryProvider, layer?.id, property);
};
