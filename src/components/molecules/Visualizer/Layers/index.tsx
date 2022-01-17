import React, { ComponentType } from "react";

import { ClusterProperty, ClusterProps } from "../Engine";
import P from "../Primitive";

import { LayerStore } from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  clusterProperty?: ClusterProperty[];
  clusterLayers?: string[];
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
  clusterLayers,
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

  return (
    <>
      {Cluster &&
        clusterProperty?.map(cluster => (
          // TODO: NEED REFACTORING: invalid dependency flow and duplicated codes
          <Cluster key={cluster.id} property={cluster}>
            {layers?.flattenLayersRaw
              ?.filter(layer =>
                cluster?.layers?.some(clusterLayer => clusterLayer.layer === layer.id),
              )
              .map(layer =>
                !layer.isVisible || !!layer.children ? null : (
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
                ),
              )}
          </Cluster>
        ))}

      {layers?.flattenLayersRaw
        ?.filter(layer => !clusterLayers?.some(clusterLayer => clusterLayer === layer.id))
        .map(layer =>
          !layer.isVisible || !!layer.children ? null : (
            <P
              key={layer.id}
              layer={layer}
              sceneProperty={sceneProperty}
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
          ),
        )}
    </>
  );
}
