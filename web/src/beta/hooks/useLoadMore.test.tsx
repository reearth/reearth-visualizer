import { renderHook, act } from "@reearth/test/utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

import useLoadMore from "./useLoadMore";

describe("useLoadMore", () => {
  let onLoadMore = vi.fn();
  let wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  let contentRef: React.MutableRefObject<HTMLDivElement | null>;

  beforeEach(() => {
    onLoadMore = vi.fn();
    wrapperRef = { current: document.createElement("div") };
    contentRef = { current: document.createElement("div") };

    Object.defineProperty(wrapperRef.current, "offsetHeight", { value: 500 });
    Object.defineProperty(contentRef.current, "offsetHeight", { value: 400 });
    Object.defineProperty(contentRef.current, "scrollHeight", { value: 1000 });
    Object.defineProperty(wrapperRef.current, "scrollTop", {
      value: 0,
      writable: true
    });
    Object.defineProperty(wrapperRef.current, "clientHeight", { value: 500 });
  });

  it("should return wrapper and content refs", () => {
    const { result } = renderHook(() =>
      useLoadMore({ data: [1, 2, 3], onLoadMore: vi.fn() })
    );

    expect(result.current.wrapperRef).toBeDefined();
    expect(result.current.contentRef).toBeDefined();
  });

  it("should call onLoadMore when data is empty", () => {
    const onLoadMore = vi.fn();
    renderHook(() => useLoadMore({ data: [], onLoadMore }));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("should call onLoadMore when scrolled near the bottom", () => {
    const { result } = renderHook(() => useLoadMore({ data: [], onLoadMore }));

    act(() => {
      vi.spyOn(result.current.wrapperRef, "current", "get").mockReturnValue(
        wrapperRef.current
      );
      vi.spyOn(result.current.contentRef, "current", "get").mockReturnValue(
        contentRef.current
      );

      if (wrapperRef.current) {
        wrapperRef.current.scrollTop = 600;
        if (wrapperRef.current) {
          wrapperRef.current.dispatchEvent(new Event("scroll"));
        }
      }
    });

    expect(onLoadMore).toHaveBeenCalled();
  });

  it("should call onLoadMore when data changes and is empty", () => {
    const { rerender } = renderHook(
      ({ data }) => useLoadMore({ data, onLoadMore }),
      {
        initialProps: { data: [] }
      }
    );

    rerender({ data: [] });

    expect(onLoadMore).toHaveBeenCalled();
  });

  it("should not call onLoadMore when data is not empty", () => {
    const { rerender } = renderHook(
      ({ data }) => useLoadMore({ data, onLoadMore }),
      {
        initialProps: { data: [1, 2, 3] }
      }
    );

    rerender({ data: [1, 2, 3] });

    expect(onLoadMore).not.toHaveBeenCalled();
  });
});
