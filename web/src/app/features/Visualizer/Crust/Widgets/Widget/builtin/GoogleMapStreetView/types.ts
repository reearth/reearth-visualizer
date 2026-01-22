import { CommonBuiltInWidgetProperty } from "../types";

export type LngLat = [number, number];
type Route = {
  title: string;
  fileUrl: string;
  id: string;
};

export type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiKey?: string;
  };
  routeFile?: Route[];
};

export type RouteFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: LngLat[];
  };
  properties?: Record<string, any>;
};

export type RouteInput = RouteFeature | string ;
