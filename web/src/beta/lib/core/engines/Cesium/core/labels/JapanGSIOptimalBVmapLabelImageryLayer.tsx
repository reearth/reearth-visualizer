import * as Cesium from "cesium";
import { useMemo, forwardRef } from "react";
import { ImageryLayer } from "resium";

import { JapanGSIOptimalBVmapLabelImageryProvider } from "./JapanGSIOptimalBVmapImageryLayer/JapanGSIOptimalBVmapLabelImageryProvider";

export interface TileLabelConfig {
  id: string;
  labelType: "japan_gsi_optimal_bvmap";
  fillColor?: string;
  outlineColor?: string;
  params: Record<string, any>;
}

interface JapanGSIOptimalBVmapLabelImageryLayersProps {
  tileLabels?: TileLabelConfig[];
}

const useImageryProvider = (tileLabelConfig: TileLabelConfig) => {
  const imageryProvider = useMemo(() => {
    if (!tileLabelConfig) return null;

    return new JapanGSIOptimalBVmapLabelImageryProvider({
      url: "https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/{z}/{x}/{y}.pbf",
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      tileWidth: 1024,
      tileHeight: 1024,
      minimumDataLevel: 4,
      maximumDataLevel: 16,
    });
  }, [tileLabelConfig]);

  return imageryProvider;
};

const JapanGSIOptimalBVmapLabelImageryLayers = forwardRef(
  ({ tileLabels = [] }: JapanGSIOptimalBVmapLabelImageryLayersProps, ref: React.Ref<any>) => {
    const imageryLayers = useMemo(() => tileLabels.map(useImageryProvider), [tileLabels]);
    return (
      <>
        {imageryLayers.map((imageryProvider, index) => {
          if (!imageryProvider) return null;
          return (
            <ImageryLayer
              ref={index === 0 ? ref : undefined}
              key={tileLabels[index].id}
              imageryProvider={imageryProvider}
              maximumTerrainLevel={17}
            />
          );
        })}
      </>
    );
  },
);

export default JapanGSIOptimalBVmapLabelImageryLayers;

JapanGSIOptimalBVmapLabelImageryLayers.displayName = "JapanGSIOptimalBVmapLabelImageryLayers";
