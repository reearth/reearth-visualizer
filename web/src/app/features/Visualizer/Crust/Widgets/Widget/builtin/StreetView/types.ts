import { CommonBuiltInWidgetProperty } from "../types";

export type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiKey?: string;
  };
};

export type LatLng = {
  lat: number;
  lng: number;
  height?: number;
};

export type Position = {
  x: number;
  y: number;
  z: number;
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
