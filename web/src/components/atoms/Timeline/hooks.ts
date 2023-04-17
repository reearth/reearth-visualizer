import React, {
  ChangeEventHandler,
  MouseEvent,
  MouseEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";

import { truncMinutes } from "@reearth/util/time";

import {
  BORDER_WIDTH,
  DAY_SECS,
  EPOCH_SEC,
  GAP_HORIZONTAL,
  MAX_ZOOM_RATIO,
  PADDING_HORIZONTAL,
  HOURS_SECS,
  NORMAL_SCALE_WIDTH,
  STRONG_SCALE_WIDTH,
} from "./constants";
import { TimeEventHandler, Range } from "./types";
import { calcScaleInterval, formatDateForTimeline } from "./utils";

const convertPositionToTime = (e: MouseEvent, { start, end }: Range) => {
  const curTar = e.currentTarget;
  const width = curTar.scrollWidth - (PADDING_HORIZONTAL + BORDER_WIDTH) * 2;
  const rect = curTar.getBoundingClientRect();
  const clientX = e.clientX - rect.x;
  const scrollX = curTar.scrollLeft;
  const posX = clientX + scrollX - (PADDING_HORIZONTAL + BORDER_WIDTH);
  const percent = posX / width;
  const rangeDiff = end - start;
  const sec = rangeDiff * percent;
  return Math.min(Math.max(start, start + sec), end);
};

type InteractionOption = {
  range: Range;
  zoom: number;
  scaleElement: RefObject<HTMLDivElement>;
  setScaleWidth: React.Dispatch<React.SetStateAction<number>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
};

const useTimelineInteraction = ({
  range: { start, end },
  zoom,
  scaleElement,
  setScaleWidth,
  setZoom,
  onClick,
  onDrag,
}: InteractionOption) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const handleOnMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);
  const handleOnMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);
  const handleOnMouseMove: MouseEventHandler = useCallback(
    e => {
      if (!isMouseDown || !onDrag || !e.target) {
        return;
      }

      onDrag(convertPositionToTime(e, { start, end }));

      const scrollThreshold = 30;
      const scrollAmount = 20;
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.x;
      const curTar = e.currentTarget;
      const clientWidth = curTar.clientWidth;

      if (clientX > clientWidth - scrollThreshold) {
        curTar.scroll(curTar.scrollLeft + scrollAmount, 0);
      }
      if (clientX < scrollThreshold) {
        curTar.scroll(curTar.scrollLeft - scrollAmount, 0);
      }
    },
    [onDrag, start, end, isMouseDown],
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleOnMouseUp, { passive: true });
    return () => {
      window.removeEventListener("mouseup", handleOnMouseUp);
    };
  }, [handleOnMouseUp]);

  const handleOnClick: MouseEventHandler = useCallback(
    e => {
      if (!onClick) return;
      onClick(convertPositionToTime(e, { start, end }));
    },
    [onClick, end, start],
  );

  const handleOnWheel: WheelEventHandler = useCallback(
    e => {
      const { deltaX, deltaY } = e;
      const isHorizontal = Math.abs(deltaX) > 0 || Math.abs(deltaX) < 0;
      if (isHorizontal) return;

      setZoom(() => Math.min(Math.max(1, zoom + deltaY * -0.01), MAX_ZOOM_RATIO));
    },
    [zoom, setZoom],
  );

  useEffect(() => {
    const elm = scaleElement.current;
    if (!elm) return;

    const obs = new ResizeObserver(m => {
      const target = m[0].target;
      setScaleWidth(target.clientWidth);
    });
    obs.observe(elm);

    return () => {
      obs.disconnect();
    };
  }, [setScaleWidth, scaleElement]);

  return {
    onMouseDown: handleOnMouseDown,
    onMouseMove: handleOnMouseMove,
    onClick: handleOnClick,
    onWheel: handleOnWheel,
  };
};

type TimelinePlayerOptions = {
  currentTime: number;
  onPlay?: (isPlaying: boolean) => void;
  onPlayReversed?: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
};

const useTimelinePlayer = ({
  currentTime,
  onPlay,
  onPlayReversed,
  onSpeedChange,
}: TimelinePlayerOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingReversed, setIsPlayingReversed] = useState(false);
  const syncCurrentTimeRef = useRef(currentTime);
  const handleOnSpeedChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      onSpeedChange?.(parseInt(e.currentTarget.value, 10));
    },
    [onSpeedChange],
  );
  const toggleIsPlaying = useCallback(() => {
    if (isPlayingReversed) {
      setIsPlayingReversed(false);
      onPlayReversed?.(false);
    }
    setIsPlaying(p => !p);
    onPlay?.(!isPlaying);
  }, [isPlayingReversed, onPlay, isPlaying, onPlayReversed]);
  const toggleIsPlayingReversed = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      onPlay?.(false);
    }
    setIsPlayingReversed(p => !p);
    onPlayReversed?.(!isPlayingReversed);
  }, [isPlaying, isPlayingReversed, onPlay, onPlayReversed]);
  const formattedCurrentTime = useMemo(() => {
    const textDate = formatDateForTimeline(currentTime, { detail: true });
    const lastIdx = textDate.lastIndexOf(" ");
    const date = textDate.slice(0, lastIdx);
    const time = textDate.slice(lastIdx);
    return {
      date,
      time,
    };
  }, [currentTime]);

  useEffect(() => {
    syncCurrentTimeRef.current = currentTime;
  }, [currentTime]);

  return {
    onSpeedChange: handleOnSpeedChange,
    formattedCurrentTime,
    isPlaying,
    isPlayingReversed,
    toggleIsPlaying,
    toggleIsPlayingReversed,
  };
};

const getRange = (range?: { [K in keyof Range]?: Range[K] }): Range => {
  const { start, end } = range || {};
  if (start !== undefined && end !== undefined) {
    return { start, end };
  }

  if (start !== undefined && end === undefined) {
    return {
      start,
      end: start + DAY_SECS * EPOCH_SEC,
    };
  }

  if (start === undefined && end !== undefined) {
    return {
      start: Math.max(end - DAY_SECS * EPOCH_SEC, 0),
      end,
    };
  }

  const defaultStart = Date.now();

  return {
    start: defaultStart,
    end: defaultStart + DAY_SECS * EPOCH_SEC,
  };
};

type Option = {
  currentTime: number;
  range?: { [K in keyof Range]?: Range[K] };
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
  onPlay?: (isPlaying: boolean) => void;
  onPlayReversed?: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
};

export const useTimeline = ({
  currentTime,
  range: _range,
  onClick,
  onDrag,
  onPlay,
  onPlayReversed,
  onSpeedChange,
}: Option) => {
  const range = useMemo(() => {
    const range = getRange(_range);
    if (process.env.NODE_ENV !== "production") {
      if (range.start > range.end) {
        throw new Error("Out of range error. `range.start` should be less than `range.end`");
      }
    }
    return {
      start: truncMinutes(new Date(range.start)).getTime(),
      end: truncMinutes(new Date(range.end)).getTime(),
    };
  }, [_range]);
  const { start, end } = range;
  const [zoom, setZoom] = useState(1);
  const startDate = useMemo(() => new Date(start), [start]);
  const zoomedGap = GAP_HORIZONTAL * (zoom - Math.trunc(zoom) + 1);
  const epochDiff = end - start;

  const scaleElement = useRef<HTMLDivElement | null>(null);
  const [scaleWidth, setScaleWidth] = useState(0);

  const {
    scaleCount,
    scaleInterval,
    strongScaleMinutes,
    gap: gapHorizontal,
  } = useMemo(
    () => calcScaleInterval(epochDiff, zoom, { gap: zoomedGap, width: scaleWidth }),
    [epochDiff, zoom, scaleWidth, zoomedGap],
  );

  // Count hours scale
  const hoursCount = Math.trunc(HOURS_SECS / scaleInterval);

  // Convert scale count to pixel.
  const currentPosition = useMemo(() => {
    const diff = Math.min((currentTime - start) / EPOCH_SEC / scaleInterval, scaleCount);
    const strongScaleCount = diff / strongScaleMinutes - 1;
    return Math.max(
      (diff - strongScaleCount) * (NORMAL_SCALE_WIDTH + gapHorizontal) +
        strongScaleCount * (STRONG_SCALE_WIDTH + gapHorizontal),
      0,
    );
  }, [currentTime, start, scaleCount, gapHorizontal, scaleInterval, strongScaleMinutes]);

  const events = useTimelineInteraction({
    range,
    zoom,
    setZoom,
    onClick,
    onDrag,
    scaleElement,
    setScaleWidth,
  });
  const player = useTimelinePlayer({ currentTime, onPlay, onPlayReversed, onSpeedChange });

  return {
    startDate,
    scaleCount,
    hoursCount,
    gapHorizontal,
    scaleInterval,
    strongScaleMinutes,
    currentPosition,
    events,
    player,
    scaleElement,
    shouldScroll: zoom !== 1,
  };
};
