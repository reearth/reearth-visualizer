import { Geometry, GetSceneQuery, SketchInfo } from "../../gql";

export type NLSInfobox = {
  sceneId: string;
  layerId: string;
  propertyId?: string;
  property?: any;
  blocks?: any[];
};

export type SketchGeometry = {
  type: string;
  coordinates?: number[] | number[][] | number[][][] | number[][][][] | number[][][][];
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
  title: string;
  visible: boolean;
  layerType: string;
  config?: any;
  children?: NLSLayer[] | null;
  sketch?: Sketch;
  isSketch?: boolean;
  infobox?: NLSInfobox;
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
    ? geometry.geometries.map(g => ({
        type: g.type,
        coordinates: getGeometryCoordinates(g),
      }))
    : [
        {
          type: geometry.type,
          coordinates: getGeometryCoordinates(geometry),
        },
      ];
};

export const convertSketchFeatureCollection = (
  featureCollection: SketchInfo["featureCollection"],
) => {
  return featureCollection
    ? {
        type: featureCollection.type,
        features: featureCollection.features.map(f => ({
          id: f.id,
          type: f.type,
          properties: f.properties,
          geometry: convertGeometry(f.geometry),
        })),
      }
    : undefined;
};

export const getLayers = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.newLayers?.map((l): NLSLayer => {
    return {
      id: l.id,
      title: l.title,
      visible: l.visible,
      layerType: l.layerType,
      config: l.config,
      isSketch: l.isSketch,
      sketch: l.sketch
        ? {
            customPropertySchema: l.sketch.customPropertySchema,
            featureCollection: convertSketchFeatureCollection(
              l.sketch.featureCollection as SketchInfo["featureCollection"],
            ),
          }
        : undefined,
      infobox: l.infobox
        ? {
            sceneId: l.infobox.sceneId,
            layerId: l.infobox.layerId,
            propertyId: l.infobox.propertyId,
            property: l.infobox.property,
            blocks: l.infobox.blocks,
          }
        : undefined,
    };
  });
};
