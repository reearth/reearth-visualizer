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
  const { hideIndicator } = property ?? {};
  const { viewer } = useCesium();
  const alpha = property?.alpha;
  useEffect(() => {
    if (!imageryProvider || !viewer) return;
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const imageryLayer = imageryLayers.addImageryProvider(imageryProvider);
    Object.assign(imageryLayer, {
      bringToFront: () => {
        imageryLayers.raiseToTop(imageryLayer);
      },
      sendToBack: () => {
        imageryLayers.lowerToBottom(imageryLayer);
      },
    });
    if (alpha !== undefined && typeof alpha === "number") {
      imageryLayer.alpha = alpha;
    }
    attachTag(imageryLayer, { layerId, hideIndicator });
    return () => {
      imageryLayers.remove(imageryLayer);
    };
  }, [imageryProvider, viewer, layerId, alpha, hideIndicator]);
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
