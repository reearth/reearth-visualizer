import { ComponentType, ReactNode } from "react";

import { LatLngHeight, Camera, Typography } from "@reearth/util/value";

import type { Component } from "../Primitive";

export type EngineRef = {
  name: string;
  requestRender: () => void;
  getCamera: () => Camera | undefined;
  getLocationFromScreenXY: (x: number, y: number) => LatLngHeight | undefined;
  flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
  zoomIn: (amount: number) => void;
  zoomOut: (amount: number) => void;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  builtinPrimitives?: Record<string, Component>;
  pluginApi?: any;
  clusterComponent?: ComponentType<ClusterProps>;
};

export type FlyToDestination = {
  /** Degrees */
  lat?: number;
  /** Degrees */
  lng?: number;
  /** Meters */
  height?: number;
  /** Radian */
  heading?: number;
  /** Radian */
  pitch?: number;
  /** Radian */
  roll?: number;
  /** Radian */
  fov?: number;
};

export type LookAtDestination = {
  /** Degrees */
  lat?: number;
  /** Degrees */
  lng?: number;
  /** Meters */
  height?: number;
  /** Radian */
  heading?: number;
  /** Radian */
  pitch?: number;
  /** Radian */
  range?: number;
  /** Radian */
  fov?: number;
};

export type CameraOptions = {
  /** Seconds */
  duration?: number;
  easing?: (time: number) => number;
};

export type ClusterProps = {
  property: ClusterProperty;
  children?: ReactNode;
};

export type SceneProperty = {
  default?: {
    camera?: Camera;
    terrain?: boolean;
    terrainType?: "cesium" | "arcgis"; // default: cesium
    terrainExaggeration?: number; // default: 1
    terrainExaggerationRelativeHeight?: number; // default: 0
    depthTestAgainstTerrain?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
  };
  cameraLimiter?: {
    cameraLimitterEnabled?: boolean;
    cameraLimitterShowHelper?: boolean;
    cameraLimitterTargetArea?: Camera;
    cameraLimitterTargetWidth?: number;
    cameraLimitterTargetLength?: number;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_maxLevel?: number;
    tile_minLevel?: number;
  }[];
  terrain?: {
    terrain?: boolean;
    terrainType?: "cesium" | "arcgis"; // default: cesium
    terrainExaggeration?: number; // default: 1
    terrainExaggerationRelativeHeight?: number; // default: 0
    depthTestAgainstTerrain?: boolean;
  };
  atmosphere?: {
    enable_sun?: boolean;
    enable_lighting?: boolean;
    ground_atmosphere?: boolean;
    sky_atmosphere?: boolean;
    shadows?: boolean;
    fog?: boolean;
    fog_density?: number;
    brightness_shift?: number;
    hue_shift?: number;
    surturation_shift?: number;
  };
  timeline?: {
    animation?: boolean;
  };
  googleAnalytics?: {
    enableGA?: boolean;
    trackingId?: string;
  };
  theme?: {
    themeType?: "light" | "dark" | "forest" | "custom";
    themeTextColor?: string;
    themeSelectColor?: string;
    themeBackgroundColor?: string;
  };
};

export type ClusterProperty = {
  id: string;
  default?: {
    clusterPixelRange: number;
    clusterMinSize: number;
    clusterLabelTypography?: Typography;
    clusterImage?: string;
    clusterImageHeight?: number;
    clusterImageWidth?: number;
  };
  layers?: { layer?: string }[];
};
