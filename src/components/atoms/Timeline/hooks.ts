import React, {
  ChangeEventHandler,
  MouseEvent,
  MouseEventHandler,
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
  SCALE_ZOOM_INTERVAL,
  GAP_HORIZONTAL,
  MAX_ZOOM_RATIO,
  PADDING_HORIZONTAL,
  SCALE_INTERVAL,
  MINUTES_SEC,
  HOURS_SECS,
  NORMAL_SCALE_WIDTH,
  STRONG_SCALE_WIDTH,
} from "./constants";
import { TimeEventHandler, Range } from "./types";
import { formatDateForTimeline } from "./utils";

const convertPositionToTime = (e: MouseEvent, { start, end }: Range, gapHorizontal: number) => {
  const curTar = e.currentTarget;
  const width = curTar.scrollWidth - (PADDING_HORIZONTAL + BORDER_WIDTH) * 2 + gapHorizontal / 2;
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
  gapHorizontal: number;
  zoom: number;
  isRangeLessThanHalfHours: boolean;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
};

const useTimelineInteraction = ({
  range: { start, end },
  gapHorizontal,
  zoom,
  setZoom,
  onClick,
  onDrag,
  isRangeLessThanHalfHours,
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

      onDrag(convertPositionToTime(e, { start, end }, gapHorizontal));

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
    [onDrag, start, end, isMouseDown, gapHorizontal],
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
      onClick(convertPositionToTime(e, { start, end }, gapHorizontal));
    },
    [onClick, end, start, gapHorizontal],
  );

  const handleOnWheel: WheelEventHandler = useCallback(
    e => {
      if (isRangeLessThanHalfHours) {
        return;
      }

      const { deltaX, deltaY } = e;
      const isHorizontal = Math.abs(deltaX) > 0 || Math.abs(deltaX) < 0;
      if (isHorizontal) return;

      setZoom(() => Math.min(Math.max(1, zoom + deltaY * -0.01), MAX_ZOOM_RATIO));
    },
    [zoom, setZoom, isRangeLessThanHalfHours],
  );

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
  const [zoom, setZoom] = useState(1);
  const range = useMemo(() => {
    const range = getRange(_range);
    if (process.env.NODE_ENV !== "production") {
      if (range.start > range.end) {
        throw new Error("Out of range error. `range.start` should be less than `range.end`");
      }
    }
    return {
      start: truncMinutes(new Date(range.start)).getTime(),
      end: range.end,
    };
  }, [_range]);
  const { start, end } = range;
  const startDate = useMemo(() => new Date(start), [start]);
  const gapHorizontal = GAP_HORIZONTAL * (zoom - Math.trunc(zoom) + 1);
  const scaleInterval = Math.max(
    SCALE_INTERVAL - Math.trunc(zoom - 1) * SCALE_ZOOM_INTERVAL * MINUTES_SEC,
    MINUTES_SEC,
  );
  const epochDiff = end - start;

  // convert epoch diff to minutes.
  const scaleCount = Math.trunc(epochDiff / EPOCH_SEC / scaleInterval);

  // Count hours scale
  const hoursCount = Math.trunc(HOURS_SECS / scaleInterval);

  const strongScaleMinutes = Math.max(scaleInterval / MINUTES_SEC + Math.trunc(zoom) + 1, 10);

  // Convert scale count to pixel.
  const currentPosition = useMemo(() => {
    const diff = Math.min((currentTime - start) / EPOCH_SEC / scaleInterval, scaleCount);
    const strongScaleCount = diff / strongScaleMinutes;
    return Math.max(
      diff * gapHorizontal +
        (diff - strongScaleCount) * NORMAL_SCALE_WIDTH +
        strongScaleCount * STRONG_SCALE_WIDTH,
      0,
    );
  }, [currentTime, start, scaleCount, gapHorizontal, scaleInterval, strongScaleMinutes]);

  const isRangeLessThanHalfHours = useMemo(
    () => epochDiff < (DAY_SECS / 4) * EPOCH_SEC,
    [epochDiff],
  );

  useEffect(() => {
    if (isRangeLessThanHalfHours) {
      setZoom(MAX_ZOOM_RATIO);
    }
  }, [isRangeLessThanHalfHours]);

  const events = useTimelineInteraction({
    range,
    zoom,
    setZoom,
    gapHorizontal,
    onClick,
    onDrag,
    isRangeLessThanHalfHours,
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
  };
};
