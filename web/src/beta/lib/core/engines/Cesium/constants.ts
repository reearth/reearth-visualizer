import { CameraEventType, KeyboardEventModifier } from "cesium";

export const DEFAULT_SCREEN_SPACE_CAMERA_ASSIGNMENTS = {
  translateEventTypes: CameraEventType.LEFT_DRAG,
  zoomEventTypes: [CameraEventType.RIGHT_DRAG, CameraEventType.WHEEL, CameraEventType.PINCH],
  rotateEventTypes: CameraEventType.LEFT_DRAG,
  tiltEventTypes: [
    CameraEventType.MIDDLE_DRAG,
    CameraEventType.PINCH,
    {
      eventType: CameraEventType.LEFT_DRAG,
      modifier: KeyboardEventModifier.CTRL,
    },
    {
      eventType: CameraEventType.RIGHT_DRAG,
      modifier: KeyboardEventModifier.CTRL,
    },
  ],
  lookEventTypes: [
    {
      eventType: CameraEventType.LEFT_DRAG,
      modifier: KeyboardEventModifier.SHIFT,
    },
  ],
};
