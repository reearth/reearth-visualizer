import { WebMercatorTilingScheme, ImageryLayer as CesiumImageryLayer } from "cesium";
import { forwardRef } from "react";
import { CesiumComponentRef, ImageryLayer } from "resium";

import { useInstance } from "../../../hooks/useInstance";

import {
  JapanGSIOptimalBVmapLabelImageryProvider,
  type JapanGSIOptimalBVmapLabelImageryProviderOptions,
} from "./JapanGSIOptimalBVmapLabelImageryProvider";
import { ImageryLayerProps } from "./types";

export interface LabelImageryLayerProps
  extends Omit<ImageryLayerProps, "imageryProvider">,
    JapanGSIOptimalBVmapLabelImageryProviderOptions {
  minimumLevel?: number;
  maximumLevel?: number;
  minimumDataLevel: number;
  maximumDataLevel: number;
}

export const LabelImageryLayer = forwardRef<
  CesiumComponentRef<CesiumImageryLayer>,
  LabelImageryLayerProps
>(function LabelImageryLayerPresenter(
  {
    url,
    tilingScheme,
    tileWidth,
    tileHeight,
    minimumLevel,
    maximumLevel,
    minimumDataLevel,
    maximumDataLevel,
    ...props
  },
  ref,
) {
  const imageryProvider = useInstance({
    keys: [url, tilingScheme, tileWidth, tileHeight, minimumDataLevel, maximumDataLevel],
    create: () =>
      new JapanGSIOptimalBVmapLabelImageryProvider({
        url,
        tilingScheme: tilingScheme ?? new WebMercatorTilingScheme(),
        tileWidth,
        tileHeight,
        minimumDataLevel,
        maximumDataLevel,
      }),
  });
  Object.assign(imageryProvider, {
    minimumLevel,
    maximumLevel,
  });
  return <ImageryLayer ref={ref} imageryProvider={imageryProvider} {...props} />;
});
