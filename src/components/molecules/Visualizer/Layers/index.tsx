import React from "react";

import Cluster from "../Engine/Cesium/Cluster";
import P from "../Primitive";

import { LayerStore } from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  clusterProperty?: { [key: string]: any };
  clusterLayers?: string[];
  sceneProperty?: any;
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
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
}: Props): JSX.Element | null {
  return (
    <>
      {clusterProperty?.map((cluster: any) => (
        // TODO: NEED REFACTORING: invalid dependency flow and duplicated codes
        <Cluster
          key={cluster.id}
          property={cluster}
          layers={layers}
          pluginProperty={pluginProperty}
          isEditable={isEditable}
          isBuilt={isBuilt}
          pluginBaseUrl={pluginBaseUrl}
          selectedLayerId={selectedLayerId}
          overriddenProperties={overriddenProperties}
          isLayerHidden={isLayerHidden}></Cluster>
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
