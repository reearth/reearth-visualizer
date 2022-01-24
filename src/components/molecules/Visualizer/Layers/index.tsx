import React, { ComponentType, useCallback } from "react";

import { ClusterProperty, ClusterProps } from "../Engine";
import P, { Layer } from "../Primitive";

import { LayerStore } from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  clusterProperty?: ClusterProperty[];
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
  clusterComponent?: ComponentType<ClusterProps>;
  isLayerHidden?: (id: string) => boolean;
};

export { LayerStore, empty as emptyLayerStore } from "./store";

export default function Layers({
  pluginProperty,
  clusterProperty,
  isEditable,
  isBuilt,
  pluginBaseUrl,
  layers,
  selectedLayerId,
  overriddenProperties,
  isLayerHidden,
  clusterComponent,
}: Props): JSX.Element | null {
  const Cluster = clusterComponent;

  const renderLayer = useCallback(
    (layer: Layer<any, any>) => {
      return !layer.id || !layer.isVisible || !!layer.children ? null : (
        <P
          key={layer.id}
          layer={layer}
          pluginProperty={
            layer.pluginId && layer.extensionId
              ? pluginProperty?.[`${layer.pluginId}/${layer.extensionId}`]
              : undefined
          }
          isHidden={isLayerHidden?.(layer.id)}
          isEditable={isEditable}
          isBuilt={isBuilt}
          isSelected={!!selectedLayerId && selectedLayerId === layer.id}
          pluginBaseUrl={pluginBaseUrl}
          overriddenProperties={overriddenProperties}
        />
      );
    },
    [
      isBuilt,
      isEditable,
      isLayerHidden,
      overriddenProperties,
      pluginBaseUrl,
      pluginProperty,
      selectedLayerId,
    ],
  );

  return (
    <>
      {Cluster &&
        clusterProperty
          ?.filter(cluster => !!cluster.id)
          .map(cluster => (
            <Cluster key={cluster.id} property={cluster}>
              {layers?.flattenLayersRaw
                ?.filter(layer => cluster?.layers?.some(l => l.layer === layer.id))
                .map(renderLayer)}
            </Cluster>
          ))}
      {layers?.flattenLayersRaw
        ?.filter(
          layer =>
            !clusterProperty ||
            clusterProperty.every(cluster => cluster?.layers?.every(l => l.layer !== layer.id)),
        )
        .map(renderLayer)}
    </>
  );
}
