import { useState, useCallback, useEffect, useRef } from "react";

import type { TimeEventHandler } from "@reearth/beta/lib/core/Crust/Widgets/Widget/builtin/Timeline/UI";
import { TickEvent, TickEventCallback } from "@reearth/beta/lib/core/Map";
import { TimelineManagerRef } from "@reearth/beta/lib/core/Map/useTimelineManager";

import type { Widget } from "../../types";

const MAX_RANGE = 86400000; // a day
const getOrNewDate = (d?: Date) => d ?? new Date();
const makeRange = (startTime?: number, stopTime?: number) => {
  // To avoid out of range error in Cesium, we need to turn back a hour.
  const now = Date.now() - 3600000;
  return {
    start: startTime || now - MAX_RANGE,
    end: stopTime || now,
  };
};

const DEFAULT_SPEED = 1;

export const useTimeline = ({
  widget,
  timelineManagerRef,
  isMobile,
  onPlay,
  onPause,
  onTimeChange,
  onSpeedChange,
  onTick,
  removeTickEventListener,
  onExtend,
}: {
  widget: Widget;
  timelineManagerRef?: TimelineManagerRef;
  isMobile?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onTimeChange?: (time: Date) => void;
  onTick?: TickEvent;
  removeTickEventListener?: TickEvent;
  onExtend?: (id: string, extended: boolean | undefined) => void;
}) => {
  const widgetId = widget.id;
  const [range, setRange] = useState(() =>
    makeRange(
      timelineManagerRef?.current?.timeline?.start?.getTime(),
      timelineManagerRef?.current?.timeline?.stop?.getTime(),
    ),
  );
  const [isOpened, setIsOpened] = useState(true);
  const [currentTime, setCurrentTime] = useState(() =>
    getOrNewDate(timelineManagerRef?.current?.timeline?.current).getTime(),
  );
  const isClockInitialized = useRef(false);
  const clockStartTime = timelineManagerRef?.current?.timeline?.start?.getTime();
  const clockStopTime = timelineManagerRef?.current?.timeline?.stop?.getTime();
  const clockSpeed = timelineManagerRef?.current?.options?.multiplier || DEFAULT_SPEED;

  const [speed, setSpeed] = useState(clockSpeed);

  const handleOnOpen = useCallback(() => {
    onExtend?.(widgetId, undefined);
    setIsOpened(true);
  }, [widgetId, onExtend]);

  const handleOnClose = useCallback(() => {
    onExtend?.(widgetId, false);
    setIsOpened(false);
  }, [widgetId, onExtend]);

  const lastTime = useRef<number>();
  const switchCurrentTimeToStart = useCallback(
    (t: number, isRangeChanged: boolean) => {
      const cur = isRangeChanged
        ? t
        : t > range.end
        ? range.start
        : t < range.start
        ? range.end
        : t;

      if (lastTime.current !== cur) {
        lastTime.current = cur;
        onTimeChange?.(new Date(cur));
      }
      return cur;
    },
    [range, onTimeChange],
  );

  const handleTimeEvent: TimeEventHandler = useCallback(
    currentTime => {
      const t = new Date(currentTime);
      onTimeChange?.(t);
      setCurrentTime(currentTime);
    },
    [onTimeChange],
  );

  const handleOnPlay = useCallback(
    (playing: boolean) => {
      // Stop cesium animation
      if (playing) {
        onPlay?.();
      } else {
        onPause?.();
      }
      onSpeedChange?.(Math.abs(speed));
    },
    [onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnPlayReversed = useCallback(
    (playing: boolean) => {
      // Stop cesium animation
      if (playing) {
        onPlay?.();
      } else {
        onPause?.();
      }
      onSpeedChange?.(Math.abs(speed) * -1);
    },
    [onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnSpeedChange = useCallback(
    (speed: number) => {
      setSpeed(speed);

      const absSpeed = Math.abs(speed);
      // Maybe we need to throttle changing speed.
      onSpeedChange?.(
        (timelineManagerRef?.current?.options?.multiplier ?? 1) > 0 ? absSpeed : absSpeed * -1,
      );
    },
    [onSpeedChange, timelineManagerRef],
  );

  // Initialize clock value
  useEffect(() => {
    if (!isClockInitialized.current) {
      isClockInitialized.current = true;
      queueMicrotask(() => {
        onSpeedChange?.(1);
      });
    }
  }, [onSpeedChange, onTick]);

  const handleRange = useCallback((start: number | undefined, stop: number | undefined) => {
    setRange(prev => {
      const next = makeRange(start, stop);
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
  }, []);

  const overriddenStart = timelineManagerRef?.current?.computedTimeline?.start?.getTime();
  const overriddenStop = timelineManagerRef?.current?.computedTimeline?.stop?.getTime();

  // Sync cesium clock.
  useEffect(() => {
    handleRange(overriddenStart ?? clockStartTime, overriddenStop ?? clockStopTime);
    setSpeed(Math.abs(clockSpeed));
  }, [clockStartTime, clockStopTime, clockSpeed, overriddenStart, overriddenStop, handleRange]);

  useEffect(() => {
    const h: TickEventCallback = (d, c) => {
      const isDifferentRange = range.start !== c.start.getTime() || range.end !== c.stop.getTime();
      if (isDifferentRange) {
        handleRange(c.start.getTime(), c.stop.getTime());
      }
      setCurrentTime(switchCurrentTimeToStart(d.getTime(), isDifferentRange));
    };
    onTick?.(h);
    return () => {
      removeTickEventListener?.(h);
    };
  }, [
    onTick,
    removeTickEventListener,
    switchCurrentTimeToStart,
    handleRange,
    range.start,
    range.end,
  ]);

  const onTimeChangeRef = useRef<typeof onTimeChange>();

  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  const overriddenCurrentTime = timelineManagerRef?.current?.computedTimeline?.current?.getTime();
  useEffect(() => {
    if (overriddenCurrentTime) {
      const t = Math.max(Math.min(range.end, overriddenCurrentTime), range.start);
      setCurrentTime(t);
      // onTimeChangeRef.current?.(new Date(t));
    }
  }, [overriddenCurrentTime, range]);

  useEffect(() => {
    if (isMobile) {
      onExtend?.(widgetId, true);
    } else {
      onExtend?.(widgetId, undefined);
    }
  }, [widgetId, onExtend, isMobile]);

  return {
    speed,
    range,
    isOpened,
    currentTime,
    events: {
      onOpen: handleOnOpen,
      onClose: handleOnClose,
      onClick: handleTimeEvent,
      onDrag: handleTimeEvent,
      onPlay: handleOnPlay,
      onPlayReversed: handleOnPlayReversed,
      onSpeedChange: handleOnSpeedChange,
    },
  };
};
