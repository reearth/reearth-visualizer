import { forwardRef, RefObject, type ForwardRefRenderFunction, type MutableRefObject } from "react";

import { SelectedFeatureInfo } from "@reearth/beta/lib/core/mantle";

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

export type Props = Omit<ClusteredLayerProps, "atomMap" | "isHidden"> & {
  hiddenLayers?: string[];
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  selectionReason?: LayerSelectionReason;
  sceneProperty?: any;
  requestingRenderMode?: MutableRefObject<RequestingRenderMode>;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
    info: SelectedFeatureInfo | undefined,
  ) => void;
  engineRef?: RefObject<EngineRef>;
  showStoryPanel?: boolean;
};

const Layers: ForwardRefRenderFunction<Ref, Props> = (
  {
    layers,
    hiddenLayers,
    selectedLayerId,
    selectionReason,
    requestingRenderMode,
    onLayerSelect,
    engineRef,
    showStoryPanel,
    ...props
  },
  ref,
) => {
  const { atomMap, flattenedLayers, isHidden } = useHooks({
    layers,
    ref,
    hiddenLayers,
    selectedLayerId,
    selectionReason,
    requestingRenderMode,
    onLayerSelect,
    engineRef,
  });

  return (
    <ClusteredLayers
      {...props}
      selectedLayerId={selectedLayerId}
      layers={flattenedLayers}
      atomMap={atomMap}
      isHidden={isHidden}
      showStoryPanel={showStoryPanel}
    />
  );
};

export default forwardRef(Layers);
