import { ComponentType, ReactNode } from "react";

import { LatLngHeight, Camera, Typography, Rect } from "@reearth/util/value";

import { Clock } from "../Plugin/types";
import type { Component } from "../Primitive";

export type MouseEvent = {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  height?: number;
  layerId?: string;
  delta?: number;
};

export type MouseEvents = {
  click: ((props: MouseEvent) => void) | undefined;
  doubleclick: ((props: MouseEvent) => void) | undefined;
  mousedown: ((props: MouseEvent) => void) | undefined;
  mouseup: ((props: MouseEvent) => void) | undefined;
  rightclick: ((props: MouseEvent) => void) | undefined;
  rightdown: ((props: MouseEvent) => void) | undefined;
  rightup: ((props: MouseEvent) => void) | undefined;
  middleclick: ((props: MouseEvent) => void) | undefined;
  middledown: ((props: MouseEvent) => void) | undefined;
  middleup: ((props: MouseEvent) => void) | undefined;
  mousemove: ((props: MouseEvent) => void) | undefined;
  mouseenter: ((props: MouseEvent) => void) | undefined;
  mouseleave: ((props: MouseEvent) => void) | undefined;
  wheel: ((props: MouseEvent) => void) | undefined;
};

export type MouseEventHandles = {
  onClick: (fn: MouseEvents["click"]) => void;
  onDoubleClick: (fn: MouseEvents["doubleclick"]) => void;
  onMouseDown: (fn: MouseEvents["mousedown"]) => void;
  onMouseUp: (fn: MouseEvents["mouseup"]) => void;
  onRightClick: (fn: MouseEvents["rightclick"]) => void;
  onRightDown: (fn: MouseEvents["rightdown"]) => void;
  onRightUp: (fn: MouseEvents["rightup"]) => void;
  onMiddleClick: (fn: MouseEvents["middleclick"]) => void;
  onMiddleDown: (fn: MouseEvents["middledown"]) => void;
  onMiddleUp: (fn: MouseEvents["middleup"]) => void;
  onMouseMove: (fn: MouseEvents["mousemove"]) => void;
  onMouseEnter: (fn: MouseEvents["mouseenter"]) => void;
  onMouseLeave: (fn: MouseEvents["mouseleave"]) => void;
  onWheel: (fn: MouseEvents["wheel"]) => void;
};

export type EngineRef = {
  [index in keyof MouseEventHandles]: MouseEventHandles[index];
} & {
  name: string;
  requestRender: () => void;
  getViewport: () => Rect | undefined;
  getCamera: () => Camera | undefined;
  getLocationFromScreenXY: (x: number, y: number) => LatLngHeight | undefined;
  flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
  lookAtLayer: (layerId: string) => void;
  zoomIn: (amount: number, options?: CameraOptions) => void;
  zoomOut: (amount: number, options?: CameraOptions) => void;
  orbit: (radian: number) => void;
  rotateRight: (radian: number) => void;
  changeSceneMode: (sceneMode: SceneMode | undefined, duration?: number) => void;
  getClock: () => Clock | undefined;
  captureScreen: (type?: string, encoderOptions?: number) => string | undefined;
  enableScreenSpaceCameraController: (enabled: boolean) => void;
  lookHorizontal: (amount: number) => void;
  lookVertical: (amount: number) => void;
  moveForward: (amount: number) => void;
  moveBackward: (amount: number) => void;
  moveUp: (amount: number) => void;
  moveDown: (amount: number) => void;
  moveLeft: (amount: number) => void;
  moveRight: (amount: number) => void;
  moveOverTerrain: (offset?: number) => void;
  flyToGround: (destination: FlyToDestination, options?: CameraOptions, offset?: number) => void;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  builtinPrimitives?: Record<string, Component>;
  pluginApi?: any;
  clusterComponent?: ComponentType<ClusterProps>;
  mouseEventCallbacks: MouseEvents;
};

export type SceneMode = "3d" | "2d" | "columbus";
export type IndicatorTypes = "default" | "crosshair" | "custom";

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
    allowEnterGround?: boolean;
    skybox?: boolean;
    bgcolor?: string;
    ion?: string;
    sceneMode?: SceneMode; // default: scene3d
  };
  cameraLimiter?: {
    cameraLimitterEnabled?: boolean;
    cameraLimitterShowHelper?: boolean;
    cameraLimitterTargetArea?: Camera;
    cameraLimitterTargetWidth?: number;
    cameraLimitterTargetLength?: number;
  };
  indicator?: {
    indicator_type: IndicatorTypes;
    indicator_image?: string;
    indicator_image_scale?: number;
  };
  tiles?: {
    id: string;
    tile_type?: string;
    tile_url?: string;
    tile_maxLevel?: number;
    tile_minLevel?: number;
    tile_opacity?: number;
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
    visible?: boolean;
    current?: string;
    start?: string;
    stop?: string;
    stepType?: "rate" | "fixed";
    multiplier?: number;
    step?: number;
    rangeType?: "unbounded" | "clamped" | "bounced";
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
