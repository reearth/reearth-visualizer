import { renderHook } from "@testing-library/react";
import type { Viewer as CesiumViewer } from "cesium";
import { useRef } from "react";
import type { CesiumComponentRef } from "resium";
import { vi, expect, test } from "vitest";

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

  result.current.current?.onPinchStart(fn);
  expect(result.current.current?.mouseEventCallbacks.pinchstart).toBe(fn);

  result.current.current?.mouseEventCallbacks.pinchstart?.(props);
  expect(fn).toHaveBeenCalledTimes(14);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onPinchEnd(fn);
  expect(result.current.current?.mouseEventCallbacks.pinchend).toBe(fn);

  result.current.current?.mouseEventCallbacks.pinchend?.(props);
  expect(fn).toHaveBeenCalledTimes(15);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onPinchMove(fn);
  expect(result.current.current?.mouseEventCallbacks.pinchmove).toBe(fn);

  result.current.current?.mouseEventCallbacks.pinchmove?.(props);
  expect(fn).toHaveBeenCalledTimes(16);
  expect(fn).toHaveBeenCalledWith(props);

  result.current.current?.onWheel(fn);
  expect(result.current.current?.mouseEventCallbacks.wheel).toBe(fn);

  const wheelProps = { delta: 1 };
  result.current.current?.mouseEventCallbacks.wheel?.(wheelProps);
  expect(fn).toHaveBeenCalledTimes(17);
  expect(fn).toHaveBeenCalledWith(wheelProps);
});
