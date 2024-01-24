import { ImageryLayer as CesiumImageryLayer } from "@cesium/engine";
import { forwardRef } from "react";
import { ImageryLayer, CesiumComponentRef } from "resium";

import { type ImageryLayerHandle } from "../../../../utils/ImageryLayer";
import { useInstance } from "../../hooks/useInstance";
import { labelTiles as labelTilesPresets } from "../presets";

export interface JapanGSIOptimalBVmapLabelImageryLayerProps {
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

export type JapanGSIOptimalBVmapLabelImageryLayerConfig = {
  id: string;
  labelType: "japan_gsi_optimal_bvmap";
  fillColor?: string;
  outlineColor?: string;
  params: Record<string, any>;
};

interface JapanGSIOptimalBVmapLabelImageryLayersProps {
  layersConfig?: JapanGSIOptimalBVmapLabelImageryLayerConfig[];
}

const JapanGSIOptimalBVmapLabelImageryLayer = forwardRef<
  ImageryLayerHandle[],
  JapanGSIOptimalBVmapLabelImageryLayerProps
>(({ id, labelType, params }, ref) => {
  const cesiumRef = ref as React.Ref<CesiumComponentRef<CesiumImageryLayer>>;
  const imageryProvider = useInstance({
    keys: [id, labelType, ...Object.values(params)],
    create: () => labelTilesPresets[labelType](params),
  });
  return <ImageryLayer ref={cesiumRef} imageryProvider={imageryProvider} />;
});

export const JapanGSIOptimalBVmapLabelImageryLayers: React.FC<
  JapanGSIOptimalBVmapLabelImageryLayersProps
> = ({ layersConfig }) => {
  return (
    <>
      {layersConfig?.map(({ id, labelType, fillColor, outlineColor, params }) => (
        <JapanGSIOptimalBVmapLabelImageryLayer
          key={id}
          id={id}
          labelType={labelType}
          fillColor={fillColor}
          outlineColor={outlineColor}
          params={{
            url: params.url,
            minimumLevel: params.minimumLevel,
            maximumLevel: params.maximumLevel,
            minimumDataLevel: params.minimumDataLevel,
            maximumDataLevel: params.maximumDataLevel,
          }}
        />
      ))}
    </>
  );
};

JapanGSIOptimalBVmapLabelImageryLayer.displayName = "JapanGSIOptimalBVmapLabelImageryLayer";
