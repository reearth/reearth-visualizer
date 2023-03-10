import { useState, useCallback, useEffect, useRef } from "react";

import type { TimeEventHandler } from "@reearth/components/atoms/Timeline";
import { TickEvent, TickEventCallback } from "@reearth/core/Map";

import type { Clock, Widget } from "../types";
import { useVisible } from "../useVisible";

const MAX_RANGE = 86400000; // a day
const getOrNewDate = (d?: Date) => d ?? new Date();
const makeRange = (startTime?: number, stopTime?: number) => {
  // To avoid out of range error in Cesium, we need to turn back a hour.
  const now = Date.now() - 3600000;
  return {
    start: startTime
      ? Math.min(now, startTime)
      : stopTime
      ? Math.min(now, stopTime - MAX_RANGE)
      : now,
    end:
      startTime && stopTime && startTime < stopTime
        ? stopTime
        : startTime
        ? Math.min(now, startTime + MAX_RANGE)
        : now,
  };
};

const DEFAULT_SPEED = 1;

export const useTimeline = ({
  widget,
  clock,
  overriddenClock,
  isMobile,
  onPlay,
  onPause,
  onTimeChange,
  onSpeedChange,
  onTick,
  removeTickEventListener,
  onExtend,
  onVisibilityChange,
}: {
  widget: Widget;
  clock?: Clock;
  overriddenClock?: Partial<Clock>;
  isMobile?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onTimeChange?: (time: Date) => void;
  onTick?: TickEvent;
  removeTickEventListener?: TickEvent;
  onExtend?: (id: string, extended: boolean | undefined) => void;
  onVisibilityChange?: (id: string, v: boolean) => void;
}) => {
  const visible = useVisible({
    widgetId: widget.id,
    visible: widget.property?.default?.visible,
    isMobile,
    onVisibilityChange,
  });
  const widgetId = widget.id;
  const [range, setRange] = useState(() =>
    makeRange(clock?.start?.getTime(), clock?.stop?.getTime()),
  );
  const [isOpened, setIsOpened] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => getOrNewDate(clock?.current).getTime());
  const isClockInitialized = useRef(false);
  const clockStartTime = clock?.start?.getTime();
  const clockStopTime = clock?.stop?.getTime();
  const clockSpeed = clock?.speed || DEFAULT_SPEED;

  const [speed, setSpeed] = useState(clockSpeed);

  const handleOnOpen = useCallback(() => {
    onExtend?.(widgetId, undefined);
    setIsOpened(true);
  }, [widgetId, onExtend]);

  const handleOnClose = useCallback(() => {
    onExtend?.(widgetId, false);
    setIsOpened(false);
  }, [widgetId, onExtend]);

  const switchCurrentTimeToStart = useCallback(
    (t: number) => {
      const cur = t > range.end ? range.start : t < range.start ? range.end : t;
      onTimeChange?.(new Date(cur));
      return cur;
    },
    [range, onTimeChange],
  );

  const handleTimeEvent: TimeEventHandler = useCallback(
    currentTime => {
      if (!clock) {
        return;
      }
      const t = new Date(currentTime);
      onTimeChange?.(t);
      setCurrentTime(currentTime);
    },
    [clock, onTimeChange],
  );

  const handleOnPlay = useCallback(
    (playing: boolean) => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      if (playing) {
        onPlay?.();
      } else {
        onPause?.();
      }
      onSpeedChange?.(Math.abs(speed));
    },
    [clock, onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnPlayReversed = useCallback(
    (playing: boolean) => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      if (playing) {
        onPlay?.();
      } else {
        onPause?.();
      }
      onSpeedChange?.(Math.abs(speed) * -1);
    },
    [clock, onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnSpeedChange = useCallback(
    (speed: number) => {
      setSpeed(speed);
      if (clock) {
        const absSpeed = Math.abs(speed);
        // Maybe we need to throttle changing speed.
        onSpeedChange?.((clock.speed ?? 1) > 0 ? absSpeed : absSpeed * -1);
      }
    },
    [clock, onSpeedChange],
  );

  // Initialize clock value
  useEffect(() => {
    if (clock && !isClockInitialized.current) {
      isClockInitialized.current = true;
      queueMicrotask(() => {
        onSpeedChange?.(1);
      });
    }
  }, [clock, onSpeedChange, onTick]);

  const overriddenStart = overriddenClock?.start?.getTime();
  const overriddenStop = overriddenClock?.stop?.getTime();
  // Sync cesium clock.
  useEffect(() => {
    setRange(prev => {
      const start = overriddenStart ?? clockStartTime;
      const stop = overriddenStop ?? clockStopTime;
      const next = makeRange(start, stop);
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
    setSpeed(Math.abs(clockSpeed));
  }, [clockStartTime, clockStopTime, clockSpeed, overriddenStart, overriddenStop]);

  useEffect(() => {
    const h: TickEventCallback = d => {
      if (!clock?.playing) return;
      setCurrentTime(switchCurrentTimeToStart(d.getTime()));
    };
    onTick?.(h);
    return () => {
      removeTickEventListener?.(h);
    };
  }, [onTick, clock?.playing, removeTickEventListener, switchCurrentTimeToStart]);

  const onTimeChangeRef = useRef<typeof onTimeChange>();

  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  const overriddenCurrentTime = overriddenClock?.current?.getTime();
  useEffect(() => {
    if (overriddenCurrentTime) {
      const t = Math.max(Math.min(range.end, overriddenCurrentTime), range.start);
      setCurrentTime(t);
      onTimeChangeRef.current?.(new Date(t));
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
    visible,
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
