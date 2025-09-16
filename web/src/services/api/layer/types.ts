export type NLSInfobox = {
  sceneId: string;
  layerId: string;
  propertyId?: string;
  property?: any;
  blocks?: any[];
};

export type NLSPhotoOverlay = {
  layerId?: string;
  propertyId?: string;
  property?: any;
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
  properties: any;
  geometry: SketchGeometry[];
};

export type Sketch = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customPropertySchema?: any; // Schema definition is dynamic
  featureCollection?: {
    type: string;
    features: SketchFeature[];
  };
};

// Layer configuration varies significantly by layer type and data source
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
};
