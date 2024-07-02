import {
  ComputedFeature,
  ComputedLayer,
  Feature,
  Layer,
  LayerSimple,
  LazyLayer,
  NaiveLayer,
  OverriddenLayer,
} from "@reearth/core";

export declare type LayerId = string;

export declare type Layers = {
  readonly add?: (layer: NaiveLayer) => string | undefined;
  readonly delete: (...layerIds: string[]) => void;
  readonly override: (
    id: string,
    layer?:
      | (Partial<Layer> & {
          property?: any;
        })
      | null,
  ) => void;
  readonly overridden?: OverriddenLayer[];
  readonly overrideProperty?: (properties: LayerSimple["properties"] | undefined) => void;
  readonly overriddenProperties?: { [id: string]: any };
  readonly layers: LazyLayer[];
  readonly find: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer | undefined;
  readonly findAll: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer[];
  readonly findById: (layerId: string) => LazyLayer | undefined;
  readonly findByIds: (...layerIds: string[]) => (LazyLayer | undefined)[];
  readonly findFeatureById?: (layerId: string, featureId: string) => Feature | undefined;
  readonly findFeaturesByIds?: (layerId: string, featureId: string[]) => Feature[] | undefined;
  readonly hide: (...layerIds: string[]) => void;
  readonly show: (...layerIds: string[]) => void;
  readonly select?: (layerId: string | undefined) => void;
  readonly selectFeature?: (layerId?: string, featureId?: string) => void;
  readonly selectFeatures?: (layers: { layerId?: string; featureId?: string[] }[]) => void;
  readonly selected?: ComputedLayer;
  readonly selectedFeature?: ComputedFeature;
  readonly bringToFront?: (layerId: string) => void;
  readonly sendToBack?: (layerId: string) => void;
  readonly getLayersInViewport?: () => LazyLayer[] | undefined;
};
