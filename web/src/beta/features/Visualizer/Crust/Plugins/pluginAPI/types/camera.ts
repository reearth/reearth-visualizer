import { GeoRect, LatLngHeight } from "./common";
import { LayerId } from "./layers";

export declare type Camera = {
  readonly position: CameraPosition | undefined;
  readonly fov: number | undefined;
  readonly aspectRatio: number | undefined;
  readonly viewport: GeoRect | undefined;
  readonly flyTo: (
    destination: LayerId | CameraPosition,
    options?: CameraMoveOptions & { fov?: number },
  ) => void;
  readonly flyToBoundingBox: (
    boundingBox: GeoRect,
    options?: CameraMoveOptions & {
      heading?: number;
      pitch?: number;
      range?: number;
    },
  ) => void;
  readonly zoomIn: (amount: number, options?: CameraMoveOptions) => void;
  readonly zoomOut: (amount: number, options?: CameraMoveOptions) => void;
  readonly lookAt: (
    destination: LookAtDestination,
    options?: CameraMoveOptions & { fov?: number },
  ) => void;
  readonly getGlobeIntersection: (options: { withTerrain?: boolean; calcViewSize?: boolean }) =>
    | {
        center?: LatLngHeight;
        viewSize?: number;
      }
    | undefined;
  readonly rotateAround: (radian: number) => void;
  readonly rotateRight: (radian: number) => void;
  readonly orbit: (radian: number) => void;
  readonly enableScreenSpaceCameraController: (enabled?: boolean) => void;
  readonly overrideScreenSpaceCameraController: (
    options?: ScreenSpaceCameraControllerOptions,
  ) => void;
  readonly move: (
    direction: "forward" | "backward" | "up" | "down" | "left" | "right",
    amount: number,
  ) => void;
  readonly moveOverTerrain: (offset?: number) => void;
  readonly setView: (view: CameraPosition & { fov?: number }) => void;
  readonly enableForceHorizontalRoll: (enable: boolean) => void;
  readonly on: CameraEvents["on"];
  readonly off: CameraEvents["off"];
};

export declare type CameraPosition = {
  lat?: number;
  lng?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
};

export declare type LookAtDestination = {
  lat?: number;
  lng?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  range?: number;
  radius?: number;
};

export declare type CameraMoveOptions = {
  duration?: number; // in seconds
  withoutAnimation?: boolean;
  easing?: (time: number) => number;
};

export declare type OverideCameraEventType =
  | "left_drag"
  | "right_drag"
  | "middle_drag"
  | "wheel"
  | "pinch";

export declare type OverideKeyboardEventModifier = "ctrl" | "shift" | "alt";

export declare type ModifiedCameraEventType = {
  eventType: OverideCameraEventType;
  modifier: OverideKeyboardEventModifier;
};

export declare type ScreenSpaceCameraControllerOptions = {
  zoomEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  rotateEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  tiltEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  lookEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  translateEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  minimumZoomDistance?: number;
  maximumZoomDistance?: number;
  enableCollisionDetection?: boolean;
};

export declare type CameraEventType = {
  move: [camera: CameraPosition];
};

export declare type CameraEvents = {
  readonly on: <T extends keyof CameraEventType>(
    type: T,
    callback: (...args: CameraEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof CameraEventType>(
    type: T,
    callback: (...args: CameraEventType[T]) => void,
  ) => void;
};
