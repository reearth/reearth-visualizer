import React, { useCallback, useState, useEffect, useMemo } from "react";

import { setLocalStorageData } from "@reearth/beta/utils/localstorage";

export type Direction = "vertical" | "horizontal";
export type Gutter = "start" | "end";

const getPositionFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
  const { nativeEvent } = e;
  if (nativeEvent instanceof MouseEvent) {
    const { clientX: x, clientY: y, which } = nativeEvent;
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
  let newSize = size + delta;
  if (minSize !== undefined && newSize < minSize) newSize = minSize;
  if (maxSize !== undefined && newSize > maxSize) newSize = maxSize;
  return newSize;
};

export default (
  direction: Direction,
  gutter: Gutter,
  initialSize: number,
  minSize: number,
  maxSize?: number,
  localStorageKey?: string,
) => {
  const getLocalStorageParsedState = useCallback((localStorageKey?: string) => {
    const savedState = localStorageKey && localStorage.getItem(localStorageKey);
    return savedState ? JSON.parse(savedState) : null;
  }, []);

  const [startingSize, setStartingSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [minimized, setMinimized] = useState(false);
  const [difference, setDifference] = useState(0);

  useEffect(() => {
    const setSizeBasedOnTab = () => {
      if (localStorageKey) {
        const parsedState = getLocalStorageParsedState(localStorageKey);
        const storedSize = parsedState?.size;

        if (storedSize !== undefined) {
          setSize(storedSize);
          setMinimized(parsedState.minimized);
        } else {
          setSize(initialSize);
          setMinimized(false);
        }
      }
    };
    setSizeBasedOnTab();
  }, [localStorageKey, getLocalStorageParsedState, initialSize]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const position = getPositionFromEvent(e);
      if (!position) return;

      setStartingSize(size);
      setIsResizing(true);
      setPosition(position);
    },
    [size],
  );

  const onResize = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      const { clientX: x, clientY: y } = e instanceof MouseEvent ? e : e.touches[0];
      const deltaX = gutter === "start" ? position.x - x : x - position.x;
      const deltaY = gutter === "start" ? position.y - y : y - position.y;
      const delta = getDelta(direction, deltaX, deltaY);

      const newDiff = difference + delta;

      setDifference(newDiff);

      setSize(getSize(size, delta, minSize, maxSize));

      if (!minimized && startingSize + newDiff <= minSize / 2) {
        setMinimized(true);
      }

      setPosition({ x, y });
    },
    [
      isResizing,
      gutter,
      position.x,
      position.y,
      direction,
      difference,
      size,
      minSize,
      maxSize,
      minimized,
      startingSize,
    ],
  );

  const onResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    setPosition({ x: 0, y: 0 });
    setStartingSize(size);
    setDifference(0);
    const storedData = {
      size,
      minimized,
    };
    localStorageKey && setLocalStorageData(localStorageKey, storedData);
  }, [isResizing, localStorageKey, minimized, size]);

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

  useEffect(() => {
    if (!isResizing) {
      unbindEventListeners();
      return;
    }
    bindEventListeners();
    return () => unbindEventListeners();
  }, [bindEventListeners, isResizing, unbindEventListeners]);

  const gutterProps = useMemo(
    () => ({
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => onResizeStart(e),
      onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => onResizeStart(e),
    }),
    [onResizeStart],
  );

  const handleResetSize = useCallback(() => {
    setMinimized(false);
    setSize(initialSize);
    localStorageKey &&
      setLocalStorageData(localStorageKey, {
        size: initialSize,
        minimized: false,
      });
  }, [initialSize, localStorageKey]);

  return {
    size: size || initialSize,
    gutterProps,
    minimized,
    handleResetSize,
  };
};
