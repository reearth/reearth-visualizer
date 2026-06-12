import { CommonBuiltInWidgetProperty } from "../types";

export type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiKey?: string;
  };
  // Collection field - may be array (collection) or object (processed)
  tiles?: {
    tile_type?: string;
  }[] | {
    tile_type?: string;
  };
};

export type Location = {
  longitude: number;
  latitude: number;
  height?: number;
};

export type HeadingPitch = {
  heading: number;
  pitch: number;
};

export type GeoJSONPointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, unknown>;
};
