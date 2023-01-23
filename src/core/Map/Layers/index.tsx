import { forwardRef, type ForwardRefRenderFunction } from "react";

import ClusteredLayers, { type Props as ClusteredLayerProps } from "../ClusteredLayers";
import type { ComputedLayer } from "../types";

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
  OverriddenInfobox,
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
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
};

const Layers: ForwardRefRenderFunction<Ref, Props> = (
  { layers, hiddenLayers, selectedLayerId, selectionReason, onLayerSelect, ...props },
  ref,
) => {
  const { atomMap, flattenedLayers, isHidden } = useHooks({
    layers,
    ref,
    hiddenLayers,
    selectedLayerId,
    selectionReason,
    onLayerSelect,
  });

  return (
    <ClusteredLayers {...props} layers={flattenedLayers} atomMap={atomMap} isHidden={isHidden} />
  );
};

export default forwardRef(Layers);
