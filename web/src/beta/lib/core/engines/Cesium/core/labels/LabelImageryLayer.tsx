import { WebMercatorTilingScheme } from "@cesium/engine";
import { forwardRef } from "react";
import { ImageryLayer, CesiumComponentRef } from "resium";

import { type ImageryLayerHandle, ImageryLayerProps } from "../../../../../core/utils/ImageryLayer";
import { useInstance } from "../../hooks/useInstance";

import {
  LabelImageryProvider,
  type LabelImageryProviderOptions,
} from "./JapanGSIOptimalBVmapImageryLayer/LabelImageryProvider";

export interface LabelImageryLayerProps
  extends Omit<ImageryLayerProps, "imageryProvider">,
    LabelImageryProviderOptions {
  minimumLevel?: number;
  maximumLevel?: number;
  minimumDataLevel: number;
  maximumDataLevel: number;
}

export const LabelImageryLayer = forwardRef<ImageryLayerHandle, LabelImageryLayerProps>(
  (
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
  ) => {
    const cesiumRef = ref as React.Ref<CesiumComponentRef<typeof ImageryLayer>>;
    const imageryProvider = useInstance({
      keys: [url, tilingScheme, tileWidth, tileHeight, minimumDataLevel, maximumDataLevel],
      create: () =>
        new LabelImageryProvider({
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
    return <ImageryLayer ref={cesiumRef} imageryProvider={imageryProvider} {...props} />;
  },
);

LabelImageryLayer.displayName = "LabelImageryLayer";
