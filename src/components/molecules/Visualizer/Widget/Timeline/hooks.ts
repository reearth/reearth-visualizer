import { useState, useCallback, useEffect } from "react";

import { TimeEventHandler } from "@reearth/components/atoms/Timeline/types";

import { useContext } from "../../Plugin";

const getOrNewDate = (d?: Date) => d ?? new Date();
const makeRange = (startTime?: number, stopTime?: number) => {
  return {
    start: startTime,
    end: (startTime || 0) < (stopTime || 0) ? stopTime : undefined,
  };
};

const DEFAULT_SPEED = 1;

export const useTimeline = () => {
  const ctx = useContext();
  const clock = ctx?.reearth.clock;
  const [range, setRange] = useState(() =>
    makeRange(clock?.startTime.getTime(), clock?.stopTime.getTime()),
  );
  const [isOpened, setIsOpened] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => getOrNewDate(clock?.currentTime).getTime());
  const clockCurrentTime = clock?.currentTime.getTime();
  const clockStartTime = clock?.startTime.getTime();
  const clockStopTime = clock?.stopTime.getTime();
  const clockSpeed = clock?.speed || DEFAULT_SPEED;

  const [speed, setSpeed] = useState(clockSpeed);

  const handleOnOpen = useCallback(() => {
    setIsOpened(true);
  }, []);
  const handleOnClose = useCallback(() => {
    setIsOpened(false);
  }, []);

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

  const handleOnSpeedChange = useCallback((speed: number) => {
    setSpeed(speed);
    if (clock) {
      const absSpeed = Math.abs(speed);
      // Maybe we need to throttle changing speed.
      clock.speed = clock.speed > 0 ? absSpeed : absSpeed * -1;
      clock.tick();
    }
  }, []);

  // Initialize clock value
  useEffect(() => {
    if (clock) {
      queueMicrotask(() => {
        clock.speed = 1;
        clock.tick();
      });
    }
  }, []);

  // Sync cesium clock.
  useEffect(() => {
    setCurrentTime(clockCurrentTime || Date.now());
    setRange(prev => {
      const next = makeRange(clock?.startTime.getTime(), clock?.stopTime.getTime());
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
    setSpeed(clockSpeed);
  }, [clockCurrentTime, clockStartTime, clockStopTime, clockSpeed]);

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
