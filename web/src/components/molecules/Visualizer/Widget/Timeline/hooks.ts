import { useState, useCallback, useEffect, useRef } from "react";

import { TimeEventHandler } from "@reearth/components/atoms/Timeline/types";
import { Widget } from "@reearth/components/molecules/Visualizer/Plugin";

import { useContext } from "../../Plugin";

const getOrNewDate = (d?: Date) => d ?? new Date();
const makeRange = (startTime?: number, stopTime?: number) => {
  return {
    start: startTime,
    end: (startTime || 0) < (stopTime || 0) ? stopTime : undefined,
  };
};

const DEFAULT_SPEED = 1;

export const useTimeline = ({
  widget,
  onExtend,
}: {
  widget: Widget;
  onExtend?: (id: string, extended: boolean | undefined) => void;
}) => {
  const ctx = useContext();
  const clock = ctx?.reearth.clock;
  const [range, setRange] = useState(() =>
    makeRange(clock?.startTime.getTime(), clock?.stopTime.getTime()),
  );
  const [isOpened, setIsOpened] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => getOrNewDate(clock?.currentTime).getTime());
  const isClockInitialized = useRef(false);
  const clockCurrentTime = clock?.currentTime.getTime();
  const clockStartTime = clock?.startTime.getTime();
  const clockStopTime = clock?.stopTime.getTime();
  const clockSpeed = clock?.speed || DEFAULT_SPEED;

  const [speed, setSpeed] = useState(clockSpeed);

  const handleOnOpen = useCallback(() => {
    onExtend?.(widget.id, undefined);
    setIsOpened(true);
  }, [widget.id, onExtend]);

  const handleOnClose = useCallback(() => {
    onExtend?.(widget.id, false);
    setIsOpened(false);
  }, [widget.id, onExtend]);

  const switchCurrentTimeToStart = useCallback(
    (t: number, isRangeChanged: boolean) => {
      if (!clock) {
        return;
      }
      const cur = isRangeChanged
        ? t
        : range.end && t > range.end
        ? range.start
        : range.start && t < range.start
        ? range.end
        : t;
      if (cur) {
        clock.currentTime = new Date(cur);
      }
      return cur;
    },
    [range, clock],
  );

  const handleTimeEvent: TimeEventHandler = useCallback(
    currentTime => {
      if (!clock) {
        return;
      }
      clock.currentTime = new Date(currentTime);
      setCurrentTime(getOrNewDate(clock.tick()).getTime());
    },
    [clock],
  );

  const handleOnPlay = useCallback(
    (playing: boolean) => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      clock.playing = playing;
      clock.speed = Math.abs(speed);
      clock.tick();
    },
    [clock, speed],
  );

  const handleOnPlayReversed = useCallback(
    (playing: boolean) => {
      if (!clock) {
        return;
      }

      // Stop cesium animation
      clock.playing = playing;
      clock.speed = Math.abs(speed) * -1;
      clock.tick();
    },
    [clock, speed],
  );

  const handleOnSpeedChange = useCallback(
    (speed: number) => {
      setSpeed(speed);
      if (clock) {
        const absSpeed = Math.abs(speed);
        // Maybe we need to throttle changing speed.
        clock.speed = clock.speed > 0 ? absSpeed : absSpeed * -1;
        clock.tick();
      }
    },
    [clock],
  );

  const handleRange = useCallback((start: number | undefined, stop: number | undefined) => {
    setRange(prev => {
      const next = makeRange(start, stop);
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
  }, []);

  // Initialize clock value
  useEffect(() => {
    if (clock && !isClockInitialized.current) {
      isClockInitialized.current = true;
      queueMicrotask(() => {
        clock.speed = 1;
        clock.tick();
      });
    }
  }, [clock]);

  // Sync cesium clock.
  useEffect(() => {
    const isDifferentRange = range.start !== clockStartTime || range.end !== clockStopTime;
    if (isDifferentRange) {
      handleRange(clockStartTime, clockStopTime);
    }
    setCurrentTime(
      switchCurrentTimeToStart(clockCurrentTime ?? Date.now(), isDifferentRange) ?? Date.now(),
    );
    setRange(prev => {
      const next = makeRange(clock?.startTime.getTime(), clock?.stopTime.getTime());
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
    setSpeed(Math.abs(clockSpeed));
  }, [
    range.start,
    range.end,
    clockCurrentTime,
    clockStartTime,
    clockStopTime,
    clockSpeed,
    clock?.startTime,
    clock?.stopTime,
    switchCurrentTimeToStart,
    handleRange,
  ]);

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
