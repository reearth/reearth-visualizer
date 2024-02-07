import { CameraEventType, KeyboardEventModifier } from "cesium";
import { useEffect } from "react";
import { useCesium } from "resium";

const defaultAssignments = {
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

export function useScreenSpaceCamera(): void {
  const { viewer } = useCesium();
  const scene = viewer?.scene;
  const controller = scene?.screenSpaceCameraController;

  const tiltByRightButton = false;
  const minimumZoomDistance = 1.5;
  const maximumZoomDistance = Infinity;
  const useKeyboard = false;

  useEffect(() => {
    if (!controller) return;
    controller.minimumZoomDistance = minimumZoomDistance;
    controller.maximumZoomDistance = maximumZoomDistance;
    controller.enableCollisionDetection = !useKeyboard;

    if (useKeyboard) {
      Object.assign(controller, {
        zoomEventTypes: [],
        rotateEventTypes: [],
        tiltEventTypes: [],
        lookEventTypes: [
          CameraEventType.LEFT_DRAG,
          {
            eventType: CameraEventType.LEFT_DRAG,
            modifier: KeyboardEventModifier.CTRL,
          },
          {
            eventType: CameraEventType.LEFT_DRAG,
            modifier: KeyboardEventModifier.SHIFT,
          },
        ],
      });
    } else if (tiltByRightButton) {
      Object.assign(controller, {
        ...defaultAssignments,
        // Remove right drag from zoom event types.
        zoomEventTypes: [CameraEventType.MIDDLE_DRAG, CameraEventType.WHEEL, CameraEventType.PINCH],
        // Change control-drag to right drag for tilt event types.
        tiltEventTypes: [
          CameraEventType.RIGHT_DRAG,
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
      });
    } else {
      Object.assign(controller, defaultAssignments);
    }
  }, [controller, maximumZoomDistance, tiltByRightButton, useKeyboard]);
}
