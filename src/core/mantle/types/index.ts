import type {
  LineString,
  Point,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
} from "geojson";

import type { Infobox, Block, Tag } from "../compat/types";

import type { AppearanceTypes, LayerAppearanceTypes } from "./appearance";

export * from "./appearance";
export * from "./value";
export * from "./expression";

// Layer

export type Layer = LayerSimple | LayerGroup;

export type LayerSimple = {
  type: "simple";
  data?: Data;
  properties?: any;
  defines?: Record<string, string>;
} & Partial<LayerAppearanceTypes> &
  LayerCommon;

export type LayerGroup = {
  type: "group";
  children: Layer[];
} & LayerCommon;

export type LayerCommon = {
  id: string;
  title?: string;
  /** default is true */
  visible?: boolean;
  infobox?: Infobox;
  tags?: Tag[];
  creator?: string;
  compat?: LayerCompat;
};

export type LayerCompat = { extensionId?: string; property?: any; propertyId?: string };

/** Same as a Layer, but its ID is unknown. */
export type NaiveLayer = NaiveLayerSimple | NaiveLayerGroup;
export type NaiveLayerSimple = Omit<LayerSimple, "id" | "infobox"> & { infobox?: NaiveInfobox };
export type NaiveLayerGroup = Omit<LayerGroup, "id" | "children" | "infobox"> & {
  infobox?: NaiveInfobox;
  children?: NaiveLayer[];
};
export type NaiveInfobox = Omit<Infobox, "id" | "blocks"> & { blocks?: NaiveBlock[] };
export type NaiveBlock<P = any> = Omit<Block<P>, "id">;

// Data

export type Data = {
  type: DataType;
  url?: string;
  value?: any;
  layers?: string | string[];
  jsonProperties?: string[];
  time?: {
    property?: string;
    interval?: number; // milliseconds
  };
  csv?: {
    idColumn?: string | number;
    latColumn?: string | number;
    lngColumn?: string | number;
    heightColumn?: string | number;
    noHeader?: boolean;
  };
};

export type DataRange = {
  x: number;
  y: number;
  z: number;
};

export type DataType =
  | "geojson"
  | "3dtiles"
  | "osm-buildings"
  | "czml"
  | "csv"
  | "wms"
  | "mvt"
  | "kml"
  | "gpx"
  | "shapefile"
  | "gtfs";

export type TimeInterval = [start: Date, end?: Date];

// Feature
export type CommonFeature<T extends "feature" | "computedFeature"> = {
  type: T;
  id: string;
  geometry?: Geometry;
  interval?: TimeInterval;
  properties?: any;
  range?: DataRange;
};

export type Feature = CommonFeature<"feature">;

export type Geometry = Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon;

export type ComputedLayerStatus = "fetching" | "ready";

// Computed

export type ComputedLayer = {
  id: string;
  status: ComputedLayerStatus;
  layer: Layer;
  originalFeatures: Feature[];
  features: ComputedFeature[];
  properties?: any;
} & Partial<AppearanceTypes>;

export type ComputedFeature = CommonFeature<"computedFeature"> & Partial<AppearanceTypes>;
