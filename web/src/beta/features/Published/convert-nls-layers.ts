import { NLSLayer } from "@reearth/services/api/layersApi/utils";

import { PublishedNLSLayer } from "./types";

export const convertNLSLayers = (
  layers: PublishedNLSLayer[] | undefined
): NLSLayer[] | undefined => {
  if (!layers) {
    return;
  }

  return layers.map((l) => ({
    id: l.id,
    title: l.title,
    visible: !!l.isVisible,
    layerType: l.layerType,
    config: l.config,
    isSketch: l.isSketch,
    infobox: l.nlsInfobox,
    photoOverlay: l.nlsPhotoOverlay
      ? {
          processedProperty: {
            enabled: l.nlsPhotoOverlay.property?.default?.enabled,
            cameraDuration: l.nlsPhotoOverlay.property?.default?.cameraDuration
          }
        }
      : undefined
  }));
};
