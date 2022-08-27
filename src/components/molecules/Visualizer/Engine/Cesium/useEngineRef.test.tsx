import { renderHook } from "@testing-library/react";
import { ClockStep, JulianDate, Viewer as CesiumViewer } from "cesium";
import { useRef } from "react";
import type { CesiumComponentRef } from "resium";
import { vi, expect, test } from "vitest";

import { Clock } from "../../Plugin/types";
import { EngineRef } from "../ref";

import useEngineRef from "./useEngineRef";

const fn = vi.fn(e => e);
const props = { x: 1, y: 1 };

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
  const { result } = renderHook(() => {
    const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);
    const engineRef = useRef<EngineRef>(null);
    useEngineRef(engineRef, cesium);
    return engineRef;
  });

  result.current.current?.onClick(fn);
  expect(result.current.current?.mouseEventCallbacks.click).toBe(fn);

  result.current.current?.mouseEventCallbacks.click?.(props);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onDoubleClick(fn);
  expect(result.current.current?.mouseEventCallbacks.doubleclick).toBe(fn);

  result.current.current?.mouseEventCallbacks.doubleclick?.(props);
  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMouseDown(fn);
  expect(result.current.current?.mouseEventCallbacks.mousedown).toBe(fn);

  result.current.current?.mouseEventCallbacks.mousedown?.(props);
  expect(fn).toHaveBeenCalledTimes(3);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMouseUp(fn);
  expect(result.current.current?.mouseEventCallbacks.mouseup).toBe(fn);

  result.current.current?.mouseEventCallbacks.mouseup?.(props);
  expect(fn).toHaveBeenCalledTimes(4);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onRightClick(fn);
  expect(result.current.current?.mouseEventCallbacks.rightclick).toBe(fn);

  result.current.current?.mouseEventCallbacks.rightclick?.(props);
  expect(fn).toHaveBeenCalledTimes(5);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onRightDown(fn);
  expect(result.current.current?.mouseEventCallbacks.rightdown).toBe(fn);

  result.current.current?.mouseEventCallbacks.rightdown?.(props);
  expect(fn).toHaveBeenCalledTimes(6);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onRightUp(fn);
  expect(result.current.current?.mouseEventCallbacks.rightup).toBe(fn);

  result.current.current?.mouseEventCallbacks.rightup?.(props);
  expect(fn).toHaveBeenCalledTimes(7);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleClick(fn);
  expect(result.current.current?.mouseEventCallbacks.middleclick).toBe(fn);

  result.current.current?.mouseEventCallbacks.middleclick?.(props);
  expect(fn).toHaveBeenCalledTimes(8);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleDown(fn);
  expect(result.current.current?.mouseEventCallbacks.middledown).toBe(fn);

  result.current.current?.mouseEventCallbacks.middledown?.(props);
  expect(fn).toHaveBeenCalledTimes(9);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMiddleUp(fn);
  expect(result.current.current?.mouseEventCallbacks.middleup).toBe(fn);

  result.current.current?.mouseEventCallbacks.middleup?.(props);
  expect(fn).toHaveBeenCalledTimes(10);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMouseMove(fn);
  expect(result.current.current?.mouseEventCallbacks.mousemove).toBe(fn);

  result.current.current?.mouseEventCallbacks.mousemove?.(props);
  expect(fn).toHaveBeenCalledTimes(11);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMouseEnter(fn);
  expect(result.current.current?.mouseEventCallbacks.mouseenter).toBe(fn);

  result.current.current?.mouseEventCallbacks.mouseenter?.(props);
  expect(fn).toHaveBeenCalledTimes(12);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onMouseLeave(fn);
  expect(result.current.current?.mouseEventCallbacks.mouseleave).toBe(fn);

  result.current.current?.mouseEventCallbacks.mouseleave?.(props);
  expect(fn).toHaveBeenCalledTimes(13);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onWheel(fn);
  expect(result.current.current?.mouseEventCallbacks.wheel).toBe(fn);

  const wheelProps = { delta: 1 };
  result.current.current?.mouseEventCallbacks.wheel?.(wheelProps);
  expect(fn).toHaveBeenCalledTimes(14);
  expect(fn).toHaveBeenCalledWith(wheelProps);
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
