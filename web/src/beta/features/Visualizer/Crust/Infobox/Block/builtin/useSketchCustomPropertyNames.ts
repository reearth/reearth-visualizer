import { Layer } from "@reearth/core";
import { useMemo } from "react";

export default (layer: Layer | undefined) => {
  const propertyKeys = useMemo(() => {
    if (layer?.type !== "simple" || !layer?.data?.isSketchLayer) return;

    // TODO: fix the types
    // Viz layer & core layer should be seprated
    const sketchLayer = layer as Layer & {
      sketch?: {
        customPropertySchema?: Record<string, string>;
      };
    };
    return Object.keys(sketchLayer.sketch?.customPropertySchema ?? {});
  }, [layer]);

  return propertyKeys;
};
