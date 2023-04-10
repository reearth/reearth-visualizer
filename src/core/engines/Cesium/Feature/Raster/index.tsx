import { isEqual } from "lodash-es";
import { memo } from "react";

import { extractSimpleLayer, extractSimpleLayerData, type FeatureComponentConfig } from "../utils";

import { useMVT } from "./mvt";
import { useTiles } from "./tiles";
import { useTMS } from "./tms";
import type { Props } from "./types";
import { useWMS } from "./wms";

function Raster({ isVisible, layer, property, evalFeature }: Props) {
  useWMS({ isVisible, layer, property });
  useTiles({ isVisible, layer, property });
  useTMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, evalFeature });

  return null;
}

export default memo(
  Raster,
  (prev, next) =>
    // In Raster component, we only use polygon, so we only check polygon in layer props.
    isEqual(extractSimpleLayer(prev.layer)?.polygon, extractSimpleLayer(next.layer)?.polygon) &&
    isEqual(extractSimpleLayerData(prev.layer), extractSimpleLayerData(next.layer)) &&
    isEqual(prev.property, next.property) &&
    prev.isVisible === next.isVisible &&
    prev.evalFeature === next.evalFeature &&
    prev.onComputedFeatureFetch === next.onComputedFeatureFetch,
);

export const config: FeatureComponentConfig = {
  noFeature: true,
};
