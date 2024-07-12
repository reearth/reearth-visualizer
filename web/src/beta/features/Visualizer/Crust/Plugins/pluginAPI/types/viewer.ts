import { InteractionModeType, ViewerProperty } from "@reearth/core";

import { LatLngHeight } from "./common";

export declare type Viewer = {
  readonly property: ViewerProperty | undefined;
  readonly overrideProperty: (property: ViewerProperty) => void;
  readonly viewport: Viewport;
  readonly interactionMode: InteractionMode;
  readonly env: Env;
  readonly tools: Tools;
};

export declare type ViewportSize = {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
};

export declare type Viewport = ViewportSize & {
  readonly query: Record<string, string>;
  readonly capture: (type?: string, encoderOptions?: number) => string | undefined;
};

export declare type InteractionMode = {
  readonly mode: InteractionModeType;
  readonly override?: (mode: InteractionModeType) => void;
};

export declare type Env = {
  readonly inEditor: boolean;
  readonly isBuilt: boolean;
};

export declare type Tools = {
  readonly getLocationFromScreenCoordinate: (
    x: number,
    y: number,
    withTerrain?: boolean,
  ) => LatLngHeight | undefined;
  readonly getScreenCoordinateFromPosition: (
    position: [x: number, y: number, z: number],
  ) => [x: number, y: number] | undefined;
  readonly getTerrainHeightAsync: (lng: number, lat: number) => Promise<number | undefined>;
  readonly getGlobeHeight: (lng: number, lat: number, height?: number) => number | undefined;
  readonly getGlobeHeightByCamera: () => number | undefined;
  readonly cartographicToCartesian: (
    lng: number,
    lat: number,
    height: number,
    options?: { useGlobeEllipsoid?: boolean },
  ) => [x: number, y: number, z: number] | undefined;
  readonly cartesianToCartographic: (
    x: number,
    y: number,
    z: number,
    options?: { useGlobeEllipsoid?: boolean },
  ) => [lng: number, lat: number, height: number] | undefined;
  readonly transformByOffsetOnScreen: (
    rawPosition: [x: number, y: number, z: number],
    screenOffset: [x: number, y: number],
  ) => [x: number, y: number, z: number] | undefined;
  readonly isPositionVisibleOnGlobe: (position: [x: number, y: number, z: number]) => boolean;
};
