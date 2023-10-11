import { forwardRef, useMemo, type Ref } from "react";

import useHooks, { MapRef } from "./hooks";
import Layers, { type Props as LayersProps } from "./Layers";
import type { Engine, EngineProps } from "./types";

export * from "./types";
export { useGet, type WrappedRef, type Undefinable, useOverriddenProperty } from "./utils";
export { FEATURE_FLAGS } from "../Crust/featureFlags";

export type {
  NaiveLayer,
  LazyLayer,
  FeatureComponentType,
  FeatureComponentProps,
  ClusterProperty,
  Layer,
  LayerSelectionReason,
  Cluster,
  EvalFeature,
  DefaultInfobox,
  OverriddenLayer,
} from "./Layers";

export type { MapRef as Ref } from "./hooks";

export type Props = {
  engines?: Record<string, Engine>;
  engine?: string;
  showStoryPanel?: boolean;
} & Omit<LayersProps, "Feature" | "clusterComponent" | "selectionReason" | "delegatedDataTypes"> &
  Omit<EngineProps, "selectionReason" | "onLayerSelect">;

function Map(
  {
    engines,
    engine,
    isBuilt,
    isEditable,
    clusters,
    hiddenLayers,
    layers,
    overrides,
    selectedLayerId,
    layerSelectionReason,
    showStoryPanel,
    timelineManagerRef,
    sceneProperty,
    onLayerSelect,
    ...props
  }: Props,
  ref: Ref<MapRef>,
): JSX.Element | null {
  const currentEngine = engine ? engines?.[engine] : undefined;
  const Engine = currentEngine?.component;
  const {
    engineRef,
    layersRef,
    selectedLayer,
    requestingRenderMode,
    handleLayerSelect,
    handleEngineLayerSelect,
  } = useHooks({
    ref,
    selectedLayerId,
    sceneProperty,
    timelineManagerRef,
    onLayerSelect,
  });

  const selectedLayerIdForEngine = useMemo(
    () => ({ layerId: selectedLayer.layerId, featureId: selectedLayer.featureId }),
    [selectedLayer.featureId, selectedLayer.layerId],
  );

  return Engine ? (
    <Engine
      ref={engineRef}
      isBuilt={isBuilt}
      isEditable={isEditable}
      selectedLayerId={selectedLayerIdForEngine}
      layerSelectionReason={selectedLayer.reason}
      onLayerSelect={handleEngineLayerSelect}
      layersRef={layersRef}
      requestingRenderMode={requestingRenderMode}
      timelineManagerRef={timelineManagerRef}
      {...props}>
      <Layers
        ref={layersRef}
        clusters={clusters}
        hiddenLayers={hiddenLayers}
        isBuilt={isBuilt}
        isEditable={isEditable}
        layers={layers}
        overrides={overrides}
        selectedLayerId={selectedLayerId}
        selectionReason={layerSelectionReason}
        Feature={currentEngine?.featureComponent}
        clusterComponent={currentEngine?.clusterComponent}
        delegatedDataTypes={currentEngine.delegatedDataTypes}
        meta={props.meta}
        sceneProperty={props.property}
        requestingRenderMode={requestingRenderMode}
        onLayerSelect={handleLayerSelect}
        engineRef={engineRef}
        showStoryPanel={showStoryPanel}
      />
    </Engine>
  ) : null;
}

export default forwardRef(Map);
