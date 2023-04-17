import { ComponentType, useMemo, useCallback } from "react";

import { ClusterProperty, ClusterProps } from "../Engine";
import P from "../Primitive";

import type { LayerStore, Layer } from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  clusterProperty?: ClusterProperty[];
  meta?: Record<string, unknown>;
  sceneProperty?: any;
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
  sceneProperty,
  clusterProperty,
  isEditable,
  isBuilt,
  pluginBaseUrl,
  layers,
  selectedLayerId,
  overriddenProperties,
  meta,
  isLayerHidden,
  clusterComponent,
}: Props): JSX.Element | null {
  const Cluster = clusterComponent;
  const clusteredLayers = useMemo<Set<string>>(
    () =>
      new Set(
        clusterProperty?.flatMap(c =>
          (c.layers ?? []).map(l => l.layer).filter((l): l is string => !!l),
        ),
      ),
    [clusterProperty],
  );

  const renderLayer = useCallback(
    (layer: Layer<any, any>) => {
      return !layer.id || !layer.isVisible || !!layer.children ? null : (
        <P
          key={layer.id}
          layer={layer}
          sceneProperty={sceneProperty}
          pluginProperty={
            layer.pluginId && layer.extensionId
              ? pluginProperty?.[`${layer.pluginId}/${layer.extensionId}`]
              : undefined
          }
          meta={meta}
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
      sceneProperty,
      selectedLayerId,
      meta,
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
      {layers?.flattenLayersRaw?.filter(layer => !clusteredLayers.has(layer.id)).map(renderLayer)}
    </>
  );
}
