import { useState, useEffect, RefObject, useMemo } from "react";

import { isMobileDevice } from "../utils/device";

export type Viewport = {
  width: number | undefined;
  height: number | undefined;
  isMobile: boolean | undefined;
  query: Record<string, string>;
};

type Props = {
  wrapperRef: RefObject<HTMLDivElement>;
  forceDevice?: "mobile" | "desktop" | undefined;
};

export default ({ wrapperRef, forceDevice }: Props) => {
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

      setViewport((viewport) => {
        return {
          width,
          height,
          isMobile:
            forceDevice !== undefined
              ? forceDevice === "mobile"
              : isMobileDevice(),
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
