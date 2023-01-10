import { type FeatureComponentConfig } from "../utils";

import { useMVT, useWMS } from "./hooks";
import type { Props } from "./types";

export default function Raster({ isVisible, layer, property, evalFeature }: Props) {
  useWMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, evalFeature });

  return null;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
