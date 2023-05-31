import { ComponentType } from "react";

import type {
  DataRange,
  Feature,
  ComputedLayer,
  Layer,
  DataType,
  ComputedFeature,
} from "../../mantle";

import useHooks, { type Atom, type EvalFeature } from "./hooks";

export type { EvalFeature } from "./hooks";

export type { Layer, LayerSimple, ComputedFeature } from "../types";

export type FeatureComponentType = ComponentType<FeatureComponentProps>;

export type CommonProps = {
  isBuilt?: boolean;
  isEditable?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
  meta?: Record<string, unknown>;
};

export type FeatureComponentProps = {
  layer: ComputedLayer;
  sceneProperty?: any;
  onFeatureRequest?: (range: DataRange) => void;
  onFeatureFetch?: (features: Feature[]) => void;
  onComputedFeatureFetch?: (feature: Feature[], computed: ComputedFeature[]) => void;
  onFeatureDelete?: (features: string[]) => void;
  onComputedFeatureDelete?: (features: string[]) => void;
  evalFeature: EvalFeature;
} & CommonProps;

export type Props = {
  layer?: Layer;
  atom?: Atom;
  overrides?: Record<string, any>;
  delegatedDataTypes?: DataType[];
  sceneProperty?: any;
  selectedFeatureId?: string;
  /** Feature component should be injected by a map engine. */
  Feature?: ComponentType<FeatureComponentProps>;
} & CommonProps;

export default function LayerComponent({
  Feature,
  layer,
  atom,
  overrides,
  delegatedDataTypes,
  ...props
}: Props): JSX.Element | null {
  const {
    computedLayer,
    handleFeatureDelete,
    handleComputedFeatureDelete,
    handleFeatureFetch,
    handleComputedFeatureFetch,
    handleFeatureRequest,
    evalFeature,
  } = useHooks({
    layer: Feature ? layer : undefined,
    atom,
    overrides,
    delegatedDataTypes,
    selected: props.isSelected,
    selectedFeatureId: props.selectedFeatureId,
  });

  return layer && computedLayer && Feature ? (
    <Feature
      layer={computedLayer}
      onFeatureDelete={handleFeatureDelete}
      onComputedFeatureDelete={handleComputedFeatureDelete}
      onFeatureFetch={handleFeatureFetch}
      onComputedFeatureFetch={handleComputedFeatureFetch}
      onFeatureRequest={handleFeatureRequest}
      evalFeature={evalFeature}
      {...props}
    />
  ) : null;
}
