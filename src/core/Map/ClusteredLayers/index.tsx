import { ComponentType, useMemo, useCallback, ReactNode } from "react";

import type { Layer, Atom, Typography, DataType } from "../../mantle";
import LayerComponent, { type CommonProps, type Props as LayerProps } from "../Layer";

export type Props = {
  layers?: Layer[];
  atomMap?: Map<string, Atom>;
  overrides?: Record<string, Record<string, any>>;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  isHidden?: (id: string) => boolean;
  clusters?: Cluster[];
  delegatedDataTypes?: DataType[];
  sceneProperty?: any;
  clusterComponent?: ClusterComponentType;
  Feature?: LayerProps["Feature"];
} & Omit<CommonProps, "isSelected" | "isHidden">;

export type Cluster = {
  id: string;
  property?: ClusterProperty;
  layers?: string[];
};

export type ClusterComponentProps = {
  cluster: Cluster;
  property?: ClusterProperty;
  children?: ReactNode;
};

export type ClusterProperty = {
  default?: {
    clusterPixelRange: number;
    clusterMinSize: number;
    clusterLabelTypography?: Typography;
    clusterImage?: string;
    clusterImageHeight?: number;
    clusterImageWidth?: number;
  };
  layers?: { layer?: string }[];
};

export type ClusterComponentType = ComponentType<ClusterComponentProps>;

export default function ClusteredLayers({
  clusters,
  clusterComponent,
  layers,
  atomMap,
  selectedLayerId,
  overrides,
  delegatedDataTypes,
  isHidden,
  ...props
}: Props): JSX.Element | null {
  const Cluster = clusterComponent;
  const clusteredLayers = useMemo<Set<string>>(
    () => new Set(clusters?.flatMap(c => (c.layers ?? []).filter(Boolean))),
    [clusters],
  );

  const renderLayer = useCallback(
    (layer: Layer) => {
      const a = atomMap?.get(layer.id);
      return !layer.id || !a ? null : (
        <LayerComponent
          key={layer.id}
          {...props}
          layer={layer}
          atom={a}
          overrides={overrides?.[layer.id]}
          isSelected={!!selectedLayerId?.layerId && selectedLayerId.layerId == layer.id}
          isHidden={isHidden?.(layer.id)}
          delegatedDataTypes={delegatedDataTypes}
        />
      );
    },
    [atomMap, isHidden, overrides, props, selectedLayerId, delegatedDataTypes],
  );

  return (
    <>
      {Cluster &&
        clusters
          ?.filter(cluster => !!cluster.id)
          .map(cluster => (
            <Cluster key={cluster.id} cluster={cluster}>
              {layers?.filter(layer => cluster?.layers?.some(l => l === layer.id)).map(renderLayer)}
            </Cluster>
          ))}
      {layers?.filter(layer => !clusteredLayers.has(layer.id)).map(renderLayer)}
    </>
  );
}
