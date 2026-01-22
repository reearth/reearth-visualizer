import type { Context } from ".";

// Mock function for actions
const fn = () => () => {};

export const contextEvents: Context = {
  onCameraOrbit: fn(),
  onCameraRotateRight: fn(),
  onFlyTo: fn(),
  onLayerSelect: fn(),
  onLookAt: fn(),
  onPause: fn(),
  onPlay: fn(),
  onSpeedChange: fn(),
  onTick: fn(),
  onTimeChange: fn(),
  onZoomIn: fn(),
  onZoomOut: fn()
};

