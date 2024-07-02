import { InteractionModeType, ViewerProperty } from "@reearth/core";

import { LatLngHeight } from "./common";

export declare type Viewer = {
  readonly property: ViewerProperty;
  readonly overrideProperty: (property: ViewerProperty) => void;
  readonly viewPort: Viewport;
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
};

export declare type Tools = {
  readonly getLocationFromScreen: (
    x: number,
    y: number,
    withTerrain?: boolean,
  ) => LatLngHeight | undefined;
  readonly asyncGetTerrainHeight: (lng: number, lat: number) => Promise<number | undefined>;
  readonly getGlobeHeight: (lng: number, lat: number, height?: number) => number | undefined;
};
