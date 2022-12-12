import { forwardRef, type Ref } from "react";

import useHooks, { MapRef } from "./hooks";
import Layers, { type Props as LayersProps } from "./Layers";
import { Engine, EngineProps } from "./types";

export * from "./types";

export type {
  NaiveLayer,
  LazyLayer,
  FeatureComponentType,
  FeatureComponentProps,
  ClusterProperty,
} from "./Layers";

export type Props = {
  engines?: Record<string, Engine>;
  engine?: string;
} & Omit<LayersProps, "Feature" | "clusterComponent"> &
  EngineProps;

function Map(
  {
    engines,
    engine,
    isBuilt,
    isEditable,
    sceneProperty,
    clusters,
    hiddenLayers,
    layers,
    overrides,
    selectedLayerId,
    ...props
  }: Props,
  ref: Ref<MapRef>,
): JSX.Element | null {
  const currentEngine = engine ? engines?.[engine] : undefined;
  const Engine = currentEngine?.component;
  const { engineRef } = useHooks({ ref });

  return Engine ? (
    <Engine
      ref={engineRef}
      isBuilt={isBuilt}
      isEditable={isEditable}
      property={sceneProperty}
      selectedLayerId={selectedLayerId}
      {...props}>
      <Layers
        clusters={clusters}
        hiddenLayers={hiddenLayers}
        isBuilt={isBuilt}
        isEditable={isEditable}
        layers={layers}
        overrides={overrides}
        sceneProperty={sceneProperty}
        selectedLayerId={selectedLayerId}
        Feature={currentEngine?.featureComponent}
        clusterComponent={currentEngine?.clusterComponent}
        delegatedDataTypes={currentEngine.delegatedDataTypes}
      />
    </Engine>
  ) : null;
}

export default forwardRef(Map);
