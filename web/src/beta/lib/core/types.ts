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

export type screenSpaceOptions = {
  useKeyboard: boolean;
  tiltByRightButton: boolean;
  ctrl: string;
  shift: string;
};
