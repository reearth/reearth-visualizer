import * as Cesium from "cesium";
import { useMemo, forwardRef } from "react";
import { ImageryLayer } from "resium";

import { JapanGSIOptimalBVmapLabelImageryProvider } from "./JapanGSIOptimalBVmapImageryLayer/JapanGSIOptimalBVmapLabelImageryProvider";

export interface TileLabelConfig {
  id: string;
  labelType: "japan_gsi_optimal_bvmap";
  fillColor?: string;
  outlineColor?: string;
  params: {
    url: string;
    minimumLevel?: number;
    maximumLevel?: number;
    minimumDataLevel: number;
    maximumDataLevel: number;
  };
}

interface JapanGSIOptimalBVmapLabelImageryLayersProps {
  tileLabels?: TileLabelConfig[];
}

const JapanGSIOptimalBVmapLabelImageryLayers = forwardRef(
  ({ tileLabels = [] }: JapanGSIOptimalBVmapLabelImageryLayersProps, ref: React.Ref<any>) => {
    const imageryProviders = useMemo(
      () =>
        tileLabels.map(tileLabel => {
          const { params } = tileLabel;
          return new JapanGSIOptimalBVmapLabelImageryProvider({
            url: params.url,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            tileWidth: 256,
            tileHeight: 256,
            minimumDataLevel: params.minimumDataLevel,
            maximumDataLevel: params.maximumDataLevel,
          });
        }),
      [tileLabels],
    );

    return (
      <>
        {imageryProviders.map((imageryProvider, index) => (
          <ImageryLayer
            ref={index === 0 ? ref : undefined}
            key={tileLabels[index].id}
            imageryProvider={imageryProvider}
            minimumTerrainLevel={tileLabels[index].params.minimumLevel}
            maximumTerrainLevel={tileLabels[index].params.maximumLevel}
          />
        ))}
      </>
    );
  },
);

export default JapanGSIOptimalBVmapLabelImageryLayers;

JapanGSIOptimalBVmapLabelImageryLayers.displayName = "JapanGSIOptimalBVmapLabelImageryLayers";
