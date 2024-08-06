import {
  ComputedFeature,
  ComputedLayer,
  Feature,
  Layer,
  LayerEditEvent,
  LayerLoadEvent,
  LayerVisibilityEvent,
  LazyLayer,
  NaiveLayer,
  OverriddenLayer,
} from "@reearth/core";

export declare type LayerId = string;

export declare type Layers = {
  readonly layers: LazyLayer[];
  readonly hide: (...layerIds: string[]) => void;
  readonly show: (...layerIds: string[]) => void;
  readonly add: (layer: NaiveLayer) => string | undefined;
  readonly delete?: (...layerIds: string[]) => void;
  readonly override?: (
    id: string,
    layer?:
      | (Partial<Layer> & {
          property?: unknown;
        })
      | null,
  ) => void;
  readonly overridden?: OverriddenLayer[];
  readonly find: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer | undefined;
  readonly findAll: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer[] | undefined;
  readonly findById: (layerId: string) => LazyLayer | undefined;
  readonly findByIds: (...layerIds: string[]) => (LazyLayer | undefined)[] | undefined;
  readonly findFeatureById?: (layerId: string, featureId: string) => Feature | undefined;
  readonly findFeaturesByIds?: (layerId: string, featureId: string[]) => Feature[] | undefined;
  readonly layersInViewport?: () => LazyLayer[] | undefined;
  readonly select?: (layerId: string | undefined) => void;
  readonly selectFeature?: (layerId?: string, featureId?: string) => void;
  readonly selectFeatures?: (layers: { layerId?: string; featureId?: string[] }[]) => void;
  readonly selected?: ComputedLayer;
  readonly selectedFeature?: ComputedFeature;
  readonly bringToFront?: (layerId: string) => void;
  readonly sendToBack?: (layerId: string) => void;
  readonly getLayersInViewport?: () => LazyLayer[] | undefined;
  readonly getFeaturesInScreenRect: (
    rect: [x: number, y: number, width: number, height: number],
    // TODO: Get condition as expression for plugin
    condition?: (f: ComputedFeature) => boolean,
  ) => ComputedFeature[] | undefined;
  readonly on: LayersEvents["on"];
  readonly off: LayersEvents["off"];
};

export declare type LayersEventType = {
  select: [layerId: string | undefined, featureId: string | undefined];
  edit: [e: LayerEditEvent];
  load: [e: LayerLoadEvent];
  visible: [e: LayerVisibilityEvent];
};

export declare type LayersEvents = {
  readonly on: <T extends keyof LayersEventType>(
    type: T,
    callback: (...args: LayersEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof LayersEventType>(
    type: T,
    callback: (...args: LayersEventType[T]) => void,
  ) => void;
};
