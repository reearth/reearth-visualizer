export type FlyTo = (target: string | FlyToDestination, options?: CameraOptions) => void;

export type CameraOptions = {
  /** Seconds */
  duration?: number;
  easing?: (time: number) => number;
  withoutAnimation?: boolean;
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
  /** Meters */
  radius?: number;
};

export type Position2d = [x: number, y: number];
export type Position3d = [x: number, y: number, z: number];

export type OverideCameraEventType = "left_drag" | "right_drag" | "middle_drag" | "wheel" | "pinch";
export type OverideKeyboardEventModifier = "ctrl" | "shift" | "alt";

export type ScreenSpaceCameraControllerOptions = {
  zoomEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  rotateEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  tiltEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  lookEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  translateEventTypes?: (OverideCameraEventType | ModifiedCameraEventType)[];
  minimumZoomDistance?: number;
  maximumZoomDistance?: number;
  enableCollisionDetection?: boolean;
};

export type ModifiedCameraEventType = {
  eventType: OverideCameraEventType;
  modifier: OverideKeyboardEventModifier;
};
