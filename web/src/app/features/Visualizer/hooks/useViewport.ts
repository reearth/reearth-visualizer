import { useState, useEffect, RefObject, useMemo, useRef } from "react";

import { getDeviceType } from "../../../utils/device";

export type Viewport = {
  width: number | undefined;
  height: number | undefined;
  isMobile: boolean | undefined;
  query: Record<string, string>;
};

export type Device = "mobile" | "desktop";

type Props = {
  wrapperRef: RefObject<HTMLDivElement | null>;
  forceDevice?: Device | undefined;
  onDeviceChange?: (device: Device) => void;
};

export default ({ wrapperRef, forceDevice, onDeviceChange }: Props) => {
  const query = useMemo(
    () => paramsToObject(new URLSearchParams(window.location.search)),
    []
  );
  const [viewport, setViewport] = useState<Viewport>({
    width: undefined,
    height: undefined,
    isMobile: undefined,
    query
  });

  const onDeviceChangeRef = useRef(onDeviceChange);
  onDeviceChangeRef.current = onDeviceChange;

  useEffect(() => {
    const viewportResizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries;
      let width: number | undefined;
      let height: number | undefined;

      if (entry.contentBoxSize) {
        // Firefox(v69-91) implements `contentBoxSize` as a single content rect, rather than an array
        const contentBoxSize = Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0]
          : entry.contentBoxSize;
        width = contentBoxSize.inlineSize;
        height = contentBoxSize.blockSize;
      } else if (entry.contentRect) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      } else {
        width = wrapperRef.current?.clientWidth;
        height = wrapperRef.current?.clientHeight;
      }

      const device = forceDevice !== undefined ? forceDevice : getDeviceType();
      onDeviceChangeRef.current?.(device);

      setViewport((viewport) => {
        return {
          width,
          height,
          isMobile: device === "mobile",
          query: viewport.query
        };
      });
    });

    if (wrapperRef.current) {
      viewportResizeObserver.observe(wrapperRef.current);
    }

    return () => {
      viewportResizeObserver.disconnect();
    };
  }, [wrapperRef, forceDevice]);

  return { viewport };
};

function paramsToObject(entries: URLSearchParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}
