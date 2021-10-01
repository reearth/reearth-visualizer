import React from "react";

import P from "../Primitive";

import LayerStore from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  sceneProperty?: any;
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
  isLayerHidden?: (id: string) => boolean;
};

export { default as LayerStore, empty as emptyLayerStore } from "./store";

export default function Layers({
  pluginProperty,
  sceneProperty,
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
      {layers?.flattenLayersRaw?.map(layer =>
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
