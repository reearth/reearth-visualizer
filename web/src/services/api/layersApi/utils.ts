import { Geometry, GetSceneQuery, SketchInfo } from "../../gql";
import { processNewProperty } from "../propertyApi/processNewProperty";

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

const getGeometryCoordinates = (geometry: Geometry) => {
  switch (geometry["__typename"]) {
    case "Point":
      return geometry.pointCoordinates;
    case "LineString":
      return geometry.lineStringCoordinates;
    case "Polygon":
      return geometry.polygonCoordinates;
    case "MultiPolygon":
      return geometry.multiPolygonCoordinates;
    default:
      return;
  }
};

const convertGeometry = (geometry: Geometry) => {
  return geometry["__typename"] === "GeometryCollection"
    ? geometry.geometries.map((g) => ({
        type: g.type,
        coordinates: getGeometryCoordinates(g)
      }))
    : [
        {
          type: geometry.type,
          coordinates: getGeometryCoordinates(geometry)
        }
      ];
};

export const convertSketchFeatureCollection = (
  featureCollection: SketchInfo["featureCollection"]
) => {
  return featureCollection
    ? {
        type: featureCollection.type,
        features: featureCollection.features.map((f) => ({
          id: f.id,
          type: f.type,
          properties: f.properties,
          geometry: convertGeometry(f.geometry)
        }))
      }
    : undefined;
};

export const getLayers = (rawScene?: GetSceneQuery) => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.newLayers?.map((l): NLSLayer => {
    const layer: NLSLayer = {
      id: l.id,
      index: l.index,
      title: l.title,
      visible: l.visible,
      layerType: l.layerType,
      config: l.config,
      isSketch: l.isSketch,
      sketch: l.sketch
        ? {
            customPropertySchema: l.sketch.customPropertySchema,
            featureCollection: convertSketchFeatureCollection(
              l.sketch.featureCollection as SketchInfo["featureCollection"]
            )
          }
        : undefined,
      infobox: l.infobox
        ? {
            sceneId: l.infobox.sceneId,
            layerId: l.infobox.layerId,
            propertyId: l.infobox.propertyId,
            property: l.infobox.property,
            blocks: l.infobox.blocks
          }
        : undefined
    };

    // append photoOverlay property
    if (l.photoOverlay) {
      const processedPhotoOverlayProperty = processNewProperty(
        undefined,
        l.photoOverlay.property
      );
      layer.photoOverlay = {
        layerId: l.photoOverlay.layerId,
        propertyId: l.photoOverlay.propertyId,
        property: l.photoOverlay.property,
        processedProperty: {
          enabled: processedPhotoOverlayProperty?.default?.enabled?.value,
          cameraDuration:
            processedPhotoOverlayProperty?.default?.cameraDuration?.value
        }
      };
    }

    return layer;
  });
};
