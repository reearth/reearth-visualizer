import { ImageryLayerCollection, WebMapServiceImageryProvider } from "cesium";
import { useEffect, useMemo } from "react";
import { useCesium } from "resium";

import type { RasterAppearance } from "../../..";
import { extractSimpleLayerData, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;
export type Property = RasterAppearance;

const ImageryProviders = {
  wms: WebMapServiceImageryProvider,
};

export default function Raster({ isVisible, layer, property }: Props) {
  const { minimumLevel, maximumLevel, credit } = property ?? {};
  const { viewer } = useCesium();
  const { type, url, layers } = useMemo(() => {
    const data = extractSimpleLayerData(layer);
    return {
      type: data?.type as keyof typeof ImageryProviders,
      url: data?.url,
      layers: data?.layers
        ? Array.isArray(data.layers)
          ? data.layers.join(",")
          : data?.layers
        : undefined,
    };
  }, [layer]);

  const imageryProvider = type ? ImageryProviders[type] : undefined;

  useEffect(() => {
    if (!isVisible || !imageryProvider || !url || !layers) return;
    const provider = new imageryProvider({
      url,
      layers,
      minimumLevel,
      maximumLevel,
      credit,
    });
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const layer = imageryLayers.addImageryProvider(provider);
    return () => {
      imageryLayers.remove(layer);
    };
  }, [isVisible, imageryProvider, url, viewer, layers, minimumLevel, maximumLevel, credit]);

  return null;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
