import { TileMapServiceImageryProvider } from "cesium";
import { useEffect, useState } from "react";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";

export const useTMS = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url } = useData(layer);
  const [imageryProvider, setImageryProvider] = useState<TileMapServiceImageryProvider>();

  useEffect(() => {
    if (!isVisible || !show || !url || type !== "tms") return;
    const create = async () => {
      setImageryProvider(
        await TileMapServiceImageryProvider.fromUrl(url, {
          minimumLevel,
          maximumLevel,
          credit,
        }),
      );
    };
    create();
  }, [isVisible, show, url, type, minimumLevel, maximumLevel, credit]);

  useImageryProvider(imageryProvider, layer?.id, property);
};
