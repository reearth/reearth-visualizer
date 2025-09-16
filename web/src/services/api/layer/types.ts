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
  customPropertySchema?: any;
  featureCollection?: {
    type: string;
    features: SketchFeature[];
  };
};

export type NLSLayer = {
  id: string;
  index?: number | null;
  title: string;
  visible: boolean;
  layerType: string;
  config?: any;
  children?: NLSLayer[] | null;
  sketch?: Sketch;
  isSketch?: boolean;
  infobox?: NLSInfobox;
  photoOverlay?: NLSPhotoOverlay;
};
