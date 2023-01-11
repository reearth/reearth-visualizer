import { ComponentType } from "react";

import type { DataRange, Feature, ComputedLayer, Layer, DataType } from "../../mantle";

import useHooks, { type Atoms, type EvalFeature } from "./hooks";

export type { EvalFeature } from "./hooks";

export type { Layer, LayerSimple } from "../../mantle";

export type FeatureComponentType = ComponentType<FeatureComponentProps>;

export type CommonProps = {
  isBuilt?: boolean;
  isEditable?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
  sceneProperty?: any;
};

export type FeatureComponentProps = {
  layer: ComputedLayer;
  onFeatureRequest?: (range: DataRange) => void;
  onFeatureFetch?: (features: Feature[]) => void;
  onFeatureDelete?: (features: string[]) => void;
  evalFeature: EvalFeature;
} & CommonProps;

export type Props = {
  layer?: Layer;
  atom?: Atoms;
  overrides?: Record<string, any>;
  delegatedDataTypes?: DataType[];
  /** Feature component should be injected by a map engine. */
  Feature?: ComponentType<FeatureComponentProps>;
} & CommonProps;

export default function LayerComponent({
  Feature,
  layer,
  atom: atoms,
  overrides,
  delegatedDataTypes,
  ...props
}: Props): JSX.Element | null {
  const {
    computedLayer,
    handleFeatureDelete,
    handleFeatureFetch,
    handleFeatureRequest,
    evalFeature,
  } = useHooks(Feature ? layer : undefined, atoms, overrides, delegatedDataTypes);

  return layer && computedLayer && Feature ? (
    <Feature
      layer={computedLayer}
      onFeatureDelete={handleFeatureDelete}
      onFeatureFetch={handleFeatureFetch}
      onFeatureRequest={handleFeatureRequest}
      evalFeature={evalFeature}
      {...props}
    />
  ) : null;
}
