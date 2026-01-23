import { PropertyFragmentFragment } from "@reearth/services/gql";

export type NLSInfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
  property?: PropertyFragmentFragment | null;
};

export type NLSInfobox = {
  sceneId: string;
  layerId: string;
  propertyId?: string;
  property?: PropertyFragmentFragment | null;
  blocks?: NLSInfoboxBlock[];
};

export type NLSPhotoOverlay = {
  layerId?: string;
  propertyId?: string;
  property?: PropertyFragmentFragment | null;
  processedProperty?: {
    enabled?: boolean;
    cameraDuration?: number;
  };
};

export type SketchGeometry = {
  type: string;
  coordinates?:
    | number[]
    | number[][]
    | number[][][]
    | number[][][][]
    | number[][][][];
};

export type SketchFeature = {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  geometry: SketchGeometry[];
};

export type Sketch = {
  customPropertySchema?: Record<string, string>;
  featureCollection?: {
    type: string;
    features: SketchFeature[];
  };
};

// any is from BE definition JSON
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LayerConfig = any;

export type NLSLayer = {
  id: string;
  index?: number | null;
  title: string;
  visible: boolean;
  layerType: string;
  config?: LayerConfig;
  children?: NLSLayer[] | null;
  sketch?: Sketch;
  isSketch?: boolean;
  infobox?: NLSInfobox;
  photoOverlay?: NLSPhotoOverlay;
  dataSourceName?: string;
};
