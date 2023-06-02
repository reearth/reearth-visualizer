import { ImageryLayerCollection, ImageryProvider } from "cesium";
import { useEffect, useMemo } from "react";
import { useCesium } from "resium";

import type { ComputedLayer, RasterAppearance } from "../../..";
import { attachTag, extractSimpleLayerData } from "../utils";

export const useImageryProvider = (
  imageryProvider: ImageryProvider | undefined,
  layerId: string | undefined,
  property: RasterAppearance | undefined,
) => {
  const { viewer } = useCesium();
  const alpha = property?.alpha;
  useEffect(() => {
    if (!imageryProvider || !viewer) return;
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const imageryLayer = imageryLayers.addImageryProvider(imageryProvider);
    if (alpha !== undefined && typeof alpha === "number") {
      imageryLayer.alpha = alpha;
    }
    attachTag(imageryLayer, { layerId });
    return () => {
      imageryLayers.remove(imageryLayer);
    };
  }, [imageryProvider, viewer, layerId, alpha]);
};

export const useData = (layer: ComputedLayer | undefined) => {
  return useMemo(() => {
    const data = extractSimpleLayerData(layer);
    return {
      type: data?.type,
      url: data?.url,
      layers: data?.layers
        ? Array.isArray(data.layers)
          ? data.layers.join(",")
          : data?.layers
        : undefined,
      parameters: data?.parameters,
    };
  }, [layer]);
};
