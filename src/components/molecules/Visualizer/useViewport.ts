import { useState, useEffect, RefObject } from "react";
import { useSearchParams } from "react-router-dom";

const viewportMobileMaxWidth = 768;

export type Viewport = {
  width: number | undefined;
  height: number | undefined;
  isMobile: boolean | undefined;
  query: Record<string, string>;
};

type Props = {
  wrapperRef: RefObject<HTMLDivElement>;
};

export default ({ wrapperRef }: Props) => {
  const [viewport, setViewport] = useState<Viewport>({
    width: undefined,
    height: undefined,
    isMobile: undefined,
    query: {},
  });

  useEffect(() => {
    const viewportResizeObserver = new ResizeObserver(entries => {
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

      setViewport(viewport => {
        return {
          width,
          height,
          isMobile: width ? width <= viewportMobileMaxWidth : undefined,
          query: viewport.query,
        };
      });
    });

    if (wrapperRef.current) {
      viewportResizeObserver.observe(wrapperRef.current);
    }

    return () => {
      viewportResizeObserver.disconnect();
    };
  }, [wrapperRef]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    setViewport(viewport => {
      const query = paramsToObject(searchParams.entries());
      return {
        ...viewport,
        query,
      };
    });
  }, [searchParams]);

  return viewport;
};

function paramsToObject(entries: IterableIterator<[string, string]>) {
  const result: Record<string, string> = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
}
