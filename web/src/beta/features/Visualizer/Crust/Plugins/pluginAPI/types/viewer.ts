import { ViewerProperty, ComputedFeature } from "@reearth/core";

import { LatLngHeight } from "./common";

export declare type MouseEventProps = {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  height?: number;
  layerId?: string;
  delta?: number;
};

export declare type LayerSelectWithRect = MouseEventProps & {
  pressedKey?: "shift";
};

export declare type PickedFeature = ComputedFeature & {
  layerId?: string;
};

export declare type LayerSelectWithRectEnd = LayerSelectWithRect & {
  features: PickedFeature[] | undefined;
  isClick: boolean;
};

export declare type LayerSelectWithRectMove = LayerSelectWithRect & {
  startX?: number;
  startY?: number;
  width?: number;
  height?: number;
};

export declare type LayerSelectWithRectStart = LayerSelectWithRect;

export declare type InteractionModeType = "default" | "move" | "selection" | "sketch";

export declare type Viewer = {
  readonly property: ViewerProperty | undefined;
  readonly overrideProperty: (property: ViewerProperty) => void;
  readonly viewport: Viewport;
  readonly interactionMode: InteractionMode;
  readonly env: Env;
  readonly tools: Tools;
  readonly capture: (type?: string, encoderOptions?: number) => string | undefined;
  readonly on: ViewerEvents["on"];
  readonly off: ViewerEvents["off"];
};

export declare type ViewportSize = {
  readonly width: number;
  readonly height: number;
  readonly isMobile: boolean;
};

export declare type Viewport = ViewportSize & {
  readonly query: Record<string, string>;
};

export declare type InteractionMode = {
  readonly mode: InteractionModeType;
  readonly override?: (mode: InteractionModeType) => void;
  readonly selectionMode: SelectionMode;
};

export declare type SelectionMode = {
  readonly on: SelectionModeEvents["on"];
  readonly off: SelectionModeEvents["off"];
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

export declare type ViewerEventType = {
  click: [e: MouseEvent];
  doubleClick: [e: MouseEvent];
  mouseDown: [e: MouseEvent];
  mouseUp: [e: MouseEvent];
  rightClick: [e: MouseEvent];
  rightDown: [e: MouseEvent];
  rightUp: [e: MouseEvent];
  middleClick: [e: MouseEvent];
  middleDown: [e: MouseEvent];
  middleUp: [e: MouseEvent];
  mouseMove: [e: MouseEvent];
  mouseEnter: [e: MouseEvent];
  mouseLeave: [e: MouseEvent];
  wheel: [e: MouseEvent];
  resize: [e: ViewportSize];
};

export declare type ViewerEvents = {
  readonly on: <T extends keyof ViewerEventType>(
    type: T,
    callback: (...args: ViewerEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof ViewerEventType>(
    type: T,
    callback: (...args: ViewerEventType[T]) => void,
  ) => void;
};

export declare type SelectionModeEventType = {
  marqueeStart: [e: LayerSelectWithRectStart];
  marqueeMove: [e: LayerSelectWithRectMove];
  marqueeEnd: [e: LayerSelectWithRectEnd];
};

export declare type SelectionModeEvents = {
  readonly on: <T extends keyof SelectionModeEventType>(
    type: T,
    callback: (...args: SelectionModeEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof SelectionModeEventType>(
    type: T,
    callback: (...args: SelectionModeEventType[T]) => void,
  ) => void;
};
