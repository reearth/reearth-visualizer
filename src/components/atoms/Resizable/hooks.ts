import React, { useCallback, useState, useEffect, useMemo } from "react";

type Direction = "vertical" | "horizontal";
type Gutter = "start" | "end";

const getPositionFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
  const { nativeEvent } = e;
  if (nativeEvent instanceof MouseEvent) {
    const { clientX: x, clientY: y, which } = nativeEvent;

    // When user click with right button the resize is stuck in resizing mode until users clicks again, dont continue if right click is used.
    // https://github.com/bokuweb/re-resizable/blob/06dd269f835a201b03b4f62f37533784d855fdd2/src/index.tsx#L611
    if (which === 3) return;

    return { x, y };
  }

  if (nativeEvent instanceof TouchEvent) {
    const touch = nativeEvent.touches[0];
    const { clientX: x, clientY: y } = touch;

    return { x, y };
  }

  return;
};

const getDelta = (direction: Direction, deltaX: number, deltaY: number) =>
  direction === "vertical" ? deltaX : deltaY;

const getSize = (size: number, delta: number, minSize?: number, maxSize?: number) => {
  if (minSize !== undefined && size + delta < minSize) return minSize;
  if (maxSize !== undefined && size + delta > maxSize) return maxSize;
  return size + delta;
};

export default (
  direction: Direction,
  gutter: Gutter,
  initialSize: number,
  minSize?: number,
  maxSize?: number,
) => {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const position = getPositionFromEvent(e);
      if (!position) return;

      setIsResizing(true);
      setPosition(position);
    },
    [],
  );

  const onResize = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      const { clientX: x, clientY: y } = e instanceof MouseEvent ? e : e.touches[0];
      const deltaX = gutter === "start" ? position.x - x : x - position.x;
      const deltaY = gutter === "start" ? position.y - y : y - position.y;
      const delta = getDelta(direction, deltaX, deltaY);

      setSize(getSize(size, delta, minSize, maxSize));
      setPosition({ x, y });
    },
    [isResizing, position, direction, gutter, size, minSize, maxSize],
  );

  let unbind = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

  const onResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    setPosition({ x: 0, y: 0 });
    unbind();
  }, [isResizing]);

  const bindEventListeners = useCallback(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("mouseup", onResizeEnd);
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseleave", onResizeEnd);
    window.addEventListener("touchmove", onResize);
    window.addEventListener("touchend", onResizeEnd);
  }, [onResize, onResizeEnd]);

  const unbindEventListeners = useCallback(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("mouseup", onResizeEnd);
    window.removeEventListener("mousemove", onResize);
    window.removeEventListener("mouseleave", onResizeEnd);
    window.removeEventListener("touchmove", onResize);
    window.removeEventListener("touchend", onResizeEnd);
  }, [onResize, onResizeEnd]);

  unbind = unbindEventListeners;

  useEffect(() => {
    bindEventListeners();
    return () => unbindEventListeners();
  });

  const gutterProps = useMemo(
    () => ({
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => onResizeStart(e),
      onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => onResizeStart(e),
    }),
    [onResizeStart],
  );

  return { size, gutterProps };
};
