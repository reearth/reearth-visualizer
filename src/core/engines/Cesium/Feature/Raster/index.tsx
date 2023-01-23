import { isEqual } from "lodash-es";
import { memo } from "react";

import { type FeatureComponentConfig } from "../utils";

import { useMVT, useWMS } from "./hooks";
import type { Props } from "./types";

function Raster({
  isVisible,
  layer,
  property,
  onComputedFeatureFetch,
  evalFeature,
  onFeatureDelete,
}: Props) {
  useWMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, evalFeature, onComputedFeatureFetch, onFeatureDelete });

  return null;
}

export default memo(
  Raster,
  (prev, next) =>
    // In Raster component, we only use polygon, so we only check polygon in layer props.
    isEqual(prev.layer?.polygon, next.layer?.polygon) &&
    isEqual(prev.property, next.property) &&
    prev.isVisible === next.isVisible &&
    prev.evalFeature === next.evalFeature &&
    prev.onComputedFeatureFetch === next.onComputedFeatureFetch,
);

export const config: FeatureComponentConfig = {
  noFeature: true,
};
