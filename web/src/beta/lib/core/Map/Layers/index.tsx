import { forwardRef, RefObject, type ForwardRefRenderFunction, type MutableRefObject } from "react";

import { SelectedFeatureInfo } from "@reearth/beta/lib/core/mantle";

import { InteractionModeType } from "../../Crust";
import ClusteredLayers, { type Props as ClusteredLayerProps } from "../ClusteredLayers";
import type { ComputedLayer, EngineRef, RequestingRenderMode } from "../types";

import useHooks, { LayerSelectionReason, type Ref } from "./hooks";

export type {
  CommonProps,
  FeatureComponentProps,
  FeatureComponentType,
  Layer,
  LayerSimple,
  EvalFeature,
} from "../Layer";
export type {
  LazyLayer,
  Ref,
  NaiveLayer,
  LayerSelectionReason,
  DefaultInfobox,
  OverriddenLayer,
} from "./hooks";
export type {
  ClusterComponentType,
  ClusterComponentProps,
  ClusterProperty,
  Cluster,
} from "../ClusteredLayers";

export type Props = Omit<ClusteredLayerProps, "atomMap" | "isHidden" | "selectedLayerId"> & {
  selectedLayer?: {
    layerId?: string;
    featureId?: string;
    reason?: LayerSelectionReason;
  };
  hiddenLayers?: string[];
  sceneProperty?: any;
  requestingRenderMode?: MutableRefObject<RequestingRenderMode>;
  engineRef?: RefObject<EngineRef>;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
    info: SelectedFeatureInfo | undefined,
  ) => void;
  interactionMode?: InteractionModeType;
};

const Layers: ForwardRefRenderFunction<Ref, Props> = (
  {
    layers,
    selectedLayer,
    hiddenLayers,
    requestingRenderMode,
    engineRef,
    onLayerSelect,
    interactionMode,
    ...props
  },
  ref,
) => {
  const { atomMap, flattenedLayers, isHidden } = useHooks({
    layers,
    ref,
    hiddenLayers,
    selectedLayer,
    requestingRenderMode,
    engineRef,
    onLayerSelect,
  });

  return (
    <ClusteredLayers
      {...props}
      selectedLayer={selectedLayer}
      layers={flattenedLayers}
      interactionMode={interactionMode}
      atomMap={atomMap}
      isHidden={isHidden}
    />
  );
};

export default forwardRef(Layers);
