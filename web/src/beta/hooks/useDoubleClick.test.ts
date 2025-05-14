import { renderHook } from "@reearth/test/utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import useDoubleClick from "./useDoubleClick";

describe("useDoubleClick", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should call onClick after delay when clicked once", () => {
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();

    const { result } = renderHook(() =>
      useDoubleClick(onClick, onDoubleClick, 200)
    );

    const [singleClickHandler] = result.current;

    singleClickHandler();

    expect(onClick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDoubleClick).not.toHaveBeenCalled();
  });

  test("should call onDoubleClick when clicked twice rapidly", () => {
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();

    const { result } = renderHook(() =>
      useDoubleClick(onClick, onDoubleClick, 200)
    );

    const [singleClickHandler, doubleClickHandler] = result.current;

    singleClickHandler();

    expect(onClick).not.toHaveBeenCalled();

    doubleClickHandler();

    expect(onClick).not.toHaveBeenCalled();
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  test("should not call onClick if onDoubleClick is triggered", () => {
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();

    const { result } = renderHook(() =>
      useDoubleClick(onClick, onDoubleClick, 200)
    );

    const [singleClickHandler, doubleClickHandler] = result.current;

    singleClickHandler();
    doubleClickHandler();

    vi.advanceTimersByTime(300);

    expect(onClick).not.toHaveBeenCalled();
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  test("should handle undefined callbacks gracefully", () => {
    const { result } = renderHook(() =>
      useDoubleClick(undefined, undefined, 200)
    );

    const [singleClickHandler, doubleClickHandler] = result.current;

    expect(() => {
      singleClickHandler();
      doubleClickHandler();
      vi.advanceTimersByTime(300);
    }).not.toThrow();
  });

  test("should use custom delay value", () => {
    const onClick = vi.fn();
    const customDelay = 500;

    const { result } = renderHook(() =>
      useDoubleClick(onClick, undefined, customDelay)
    );

    const [singleClickHandler] = result.current;

    singleClickHandler();
    vi.advanceTimersByTime(400);
    expect(onClick).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("should handle rapid double clicking (two clicks in succession)", () => {
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();

    const { result } = renderHook(() =>
      useDoubleClick(onClick, onDoubleClick, 200)
    );

    const [singleClickHandler, doubleClickHandler] = result.current;
    singleClickHandler();
    vi.advanceTimersByTime(50);
    doubleClickHandler();
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("should handle double click with varying timing between clicks", () => {
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    const delay = 200;

    const { result } = renderHook(() =>
      useDoubleClick(onClick, onDoubleClick, delay)
    );

    const [singleClickHandler, doubleClickHandler] = result.current;

    const timings = [10, 50, 100, 199];

    timings.forEach((timing) => {
      onClick.mockReset();
      onDoubleClick.mockReset();
      singleClickHandler();
      vi.advanceTimersByTime(timing);
      doubleClickHandler();
      expect(onDoubleClick).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
      vi.advanceTimersByTime(delay);
    });
  });
});
