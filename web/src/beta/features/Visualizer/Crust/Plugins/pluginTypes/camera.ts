import { GeoRect, LatLngHeight } from "./common";
import { LayerId } from "./layers";

export declare type Camera = {
  readonly position: CameraPosition | undefined;
  readonly fov: number | undefined;
  readonly viewport: GeoRect;
  // TODO: breaking change. fov is moved to options.
  readonly flyTo: (
    destination: LayerId | CameraPosition,
    options?: CameraMoveOptions & { fov?: number },
  ) => void;
  // TODO: breaking change. renamed.
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
  // TODO: breaking change. fov is moved to options.
  readonly lookAt: (
    destination: LookAtDestination,
    options?: CameraMoveOptions & { fov?: number },
  ) => void;
  // TODO: breaking change. viewSize is removed
  readonly getGlobeIntersection: (options: { withTerrain?: boolean }) =>
    | {
        center?: LatLngHeight;
        distance?: number;
      }
    | undefined;
  // TODO: breaking change. renamed.
  readonly rotateAround: (radian: number) => void;
  readonly rotateRight: (radian: number) => void;
  // TODO: refine on core: add options as amount, currently is hardcoded
  readonly orbit: (radian: number) => void;
  readonly enableScreenSpaceController: (enabled: boolean) => void;
  readonly overrideScreenSpaceController: (options: ScreenSpaceCameraControllerOptions) => void;
  // TODO: breaking change. lookHorizontal lookVertical removed.
  // TODO: breaking change. merged functions.
  readonly moveForward: (
    direction: "forward" | "backward" | "up" | "down" | "left" | "right",
    amount: number,
  ) => void;
  readonly moveOverTerrain: (offset?: number) => void;
  // TODO: breaking change. flyToGround removed.
  readonly setView: (view: CameraPosition & { fov?: number }) => void;
  readonly forceHorizontalRoll: (enable: boolean) => void;
};

export declare type CameraPosition = {
  lat: number;
  lng: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
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
