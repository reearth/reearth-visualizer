import { renderHook } from "@testing-library/react";
import { ClockStep, JulianDate, Viewer as CesiumViewer } from "cesium";
import { useRef } from "react";
import type { CesiumComponentRef } from "resium";
import { vi, expect, test } from "vitest";

import { Clock } from "../../Plugin/types";
import { EngineRef } from "../ref";

import useEngineRef from "./useEngineRef";

test("engine should be cesium", () => {
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });
  expect(result.current.current?.name).toBe("cesium");
});

test("bind mouse events", () => {
  const mockMouseEventCallback = vi.fn(e => e);
  const props = { x: 1, y: 1 };
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.onClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.click).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.click?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(1);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onDoubleClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.doubleclick).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.doubleclick?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(2);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mousedown).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mousedown?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(3);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseup).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseup?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(4);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightclick).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightclick?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(5);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightdown).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightdown?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(6);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onRightUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.rightup).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.rightup?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(7);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleClick(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middleclick).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middleclick?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(8);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleDown(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middledown).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middledown?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(9);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleUp(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.middleup).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.middleup?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(10);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseMove(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mousemove).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mousemove?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(11);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseEnter(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseenter).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseenter?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(12);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onMouseLeave(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.mouseleave).toBe(mockMouseEventCallback);

  result.current.current?.mouseEventCallbacks.mouseleave?.(props);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(13);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(props);

  result.current.current?.onWheel(mockMouseEventCallback);
  expect(result.current.current?.mouseEventCallbacks.wheel).toBe(mockMouseEventCallback);

  const wheelProps = { delta: 1 };
  result.current.current?.mouseEventCallbacks.wheel?.(wheelProps);
  expect(mockMouseEventCallback).toHaveBeenCalledTimes(14);
  expect(mockMouseEventCallback).toHaveBeenCalledWith(wheelProps);
});

const mockRequestRender = vi.fn();
test("requestRender", () => {
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scene: {
          requestRender: mockRequestRender,
        },
        isDestroyed: () => {
          return false;
        },
      },
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });
  result.current.current?.requestRender();
  expect(mockRequestRender).toHaveBeenCalledTimes(1);
});

const mockZoomIn = vi.fn(amount => amount);
const mockZoomOut = vi.fn(amount => amount);
test("zoom", () => {
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scene: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          camera: {
            zoomIn: mockZoomIn,
            zoomOut: mockZoomOut,
          },
        },
        isDestroyed: () => {
          return false;
        },
      },
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.zoomIn(10);
  expect(mockZoomIn).toHaveBeenCalledTimes(1);
  expect(mockZoomIn).toHaveBeenCalledWith(10);

  result.current.current?.zoomOut(20);
  expect(mockZoomOut).toHaveBeenCalledTimes(1);
  expect(mockZoomOut).toHaveBeenCalledWith(20);
});

test("getClock", () => {
  const tickTime = JulianDate.fromIso8601("2022-01-13");
  const mockAddEventHandler: any = vi.fn(_cb => {});
  const mockRemoveEventHandler: any = vi.fn(_cb => {});
  const mockTick = vi.fn(() => tickTime);

  const startTime = JulianDate.fromIso8601("2022-01-11");
  const stopTime = JulianDate.fromIso8601("2022-01-15");
  const currentTime = JulianDate.fromIso8601("2022-01-14");
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        clock: {
          startTime,
          stopTime,
          tick: mockTick,
          currentTime,
          shouldAnimate: false,
          multiplier: 1,
          clockStep: ClockStep.SYSTEM_CLOCK,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // TODO: should test cesium event
          onTick: {
            addEventListener: mockAddEventHandler,
            removeEventListener: mockRemoveEventHandler,
          },
        },
        isDestroyed: () => {
          return false;
        },
      },
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return { engineRef, cesium };
  });

  expect(result.current.engineRef.current?.getClock()?.startTime).toEqual(
    JulianDate.toDate(startTime),
  );
  expect(result.current.engineRef.current?.getClock()?.stopTime).toEqual(
    JulianDate.toDate(stopTime),
  );
  expect(result.current.engineRef.current?.getClock()?.currentTime).toEqual(
    JulianDate.toDate(currentTime),
  );
  expect(result.current.engineRef.current?.getClock()?.playing).toBeFalsy();
  expect(result.current.cesium.current.cesiumElement?.clock?.shouldAnimate).toBeFalsy();
  expect(result.current.engineRef.current?.getClock()?.speed).toBe(1);
  expect(result.current.cesium.current.cesiumElement?.clock?.multiplier).toBe(1);
  expect(result.current.cesium.current.cesiumElement?.clock?.clockStep).toBe(
    ClockStep.SYSTEM_CLOCK,
  );

  const nextTickTime = result.current.engineRef.current?.getClock()?.tick();

  expect(nextTickTime).toEqual(JulianDate.toDate(tickTime));

  const nextStartTime = JulianDate.fromIso8601("2022-01-10");
  const nextStopTime = JulianDate.fromIso8601("2022-01-16");
  const nextCurrentTime = JulianDate.fromIso8601("2022-01-11");
  const clock = result.current.engineRef.current?.getClock() || ({} as Clock);
  clock.startTime = JulianDate.toDate(nextStartTime);
  clock.stopTime = JulianDate.toDate(nextStopTime);
  clock.currentTime = JulianDate.toDate(nextCurrentTime);
  clock.playing = true;
  clock.speed = 2;
  expect(result.current.engineRef.current?.getClock()?.startTime).toEqual(
    JulianDate.toDate(nextStartTime),
  );
  expect(result.current.engineRef.current?.getClock()?.stopTime).toEqual(
    JulianDate.toDate(nextStopTime),
  );
  expect(result.current.engineRef.current?.getClock()?.currentTime).toEqual(
    JulianDate.toDate(nextCurrentTime),
  );
  expect(result.current.engineRef.current?.getClock()?.playing).toBeTruthy();
  expect(result.current.cesium.current.cesiumElement?.clock?.shouldAnimate).toBeTruthy();
  expect(result.current.engineRef.current?.getClock()?.speed).toBe(2);
  expect(result.current.cesium.current.cesiumElement?.clock?.multiplier).toBe(2);
  expect(result.current.cesium.current.cesiumElement?.clock?.clockStep).toBe(
    ClockStep.SYSTEM_CLOCK_MULTIPLIER,
  );
});

test("captureScreen", () => {
  const mockViewerRender = vi.fn();
  const mockCanvasToDataURL = vi.fn();
  const mockViewerIsDestroyed = vi.fn(() => false);
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>({
      cesiumElement: {
        render: mockViewerRender,
        isDestroyed: mockViewerIsDestroyed,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        canvas: {
          toDataURL: mockCanvasToDataURL,
        },
      },
    });
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.captureScreen();
  expect(mockViewerRender).toHaveBeenCalledTimes(1);
  expect(mockCanvasToDataURL).toHaveBeenCalledTimes(1);

  result.current.current?.captureScreen("image/jpeg", 0.8);
  expect(mockCanvasToDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
});
