import { ScreenSpaceEventHandler, type ScreenSpaceEventType } from "@cesium/engine";
import { useEffect, useRef } from "react";
import { useCesium } from "resium";

import { useInstance } from "./useInstance";

// prettier-ignore
type EventTypeMap = [
    [ScreenSpaceEventType.LEFT_DOWN, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.LEFT_UP, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.LEFT_CLICK, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.LEFT_DOUBLE_CLICK, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.RIGHT_DOWN, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.RIGHT_UP, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.RIGHT_CLICK, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.MIDDLE_DOWN, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.MIDDLE_UP, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.MIDDLE_CLICK, ScreenSpaceEventHandler.PositionedEventCallback],
    [ScreenSpaceEventType.MOUSE_MOVE, ScreenSpaceEventHandler.MotionEventCallback],
    [ScreenSpaceEventType.WHEEL, ScreenSpaceEventHandler.WheelEventCallback],
    [ScreenSpaceEventType.PINCH_START, ScreenSpaceEventHandler.TwoPointEventCallback],
    [ScreenSpaceEventType.PINCH_END, ScreenSpaceEventHandler.TwoPointEventCallback],
    [ScreenSpaceEventType.PINCH_MOVE, ScreenSpaceEventHandler.TwoPointMotionEventCallback],
  ]

export function useScreenSpaceEventHandler(): ScreenSpaceEventHandler {
  const canvas = useCesium();
  return useInstance({
    keys: [canvas],
    create: () => new ScreenSpaceEventHandler(canvas),
  });
}

export type ScreenSpaceEventCallback<T extends ScreenSpaceEventType> = {
  [K in keyof EventTypeMap]: EventTypeMap[K] extends [T, infer U] ? U : never;
}[keyof EventTypeMap];

export function useScreenSpaceEvent<T extends ScreenSpaceEventType>(
  eventHandler: ScreenSpaceEventHandler,
  eventType: T,
  callback: ScreenSpaceEventCallback<T>,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Event handler can be destroyed outside of this hook.
  useEffect(() => {
    if (eventHandler.isDestroyed()) {
      return;
    }
    // Event handler callback types don't intersect each other.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventHandler.setInputAction((event: any) => {
      callbackRef.current(event);
    }, eventType);
    return () => {
      if (!eventHandler.isDestroyed()) {
        eventHandler.removeInputAction(eventType);
      }
    };
  }, [eventHandler, eventType]);
}
