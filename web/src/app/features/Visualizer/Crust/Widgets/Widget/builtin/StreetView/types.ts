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

export type XYZ = {
  x: number;
  y: number;
  z: number;
  radius?: number;
};