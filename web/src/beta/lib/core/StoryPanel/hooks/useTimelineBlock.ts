import { useCallback, useEffect, useRef, useState } from "react";

import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";

import { TickEventCallback, TimelineCommitter } from "../../Map/useTimelineManager";
import { formatDateToSting, formatDateToUnix } from "../utils";

type TimeHandler = (t: number) => void;
const getNewDate = (d?: Date) => d ?? new Date();
const calculateEndTime = (date: Date) => {
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

const calculateMidTime = (startTime: number, stopTime: number) => {
  return (startTime + stopTime) / 2;
};

const timeRange = (startTime?: number, stopTime?: number) => {
  // To avoid out of range error in Cesium, we need to turn back a hour.
  const now = Date.now() - 3600000;
  return {
    start: startTime || now,
    end: stopTime || calculateEndTime(new Date()),
    mid: calculateMidTime(startTime || now, stopTime || calculateEndTime(new Date())),
  };
};

export default (timeValues: any) => {
  const visualizerContext = useVisualizer();
  const [currentTime, setCurrentTime] = useState(() =>
    getNewDate(visualizerContext?.current?.timeline?.current?.timeline?.current)?.getTime(),
  );
  const [range, setRange] = useState(() =>
    timeRange(
      visualizerContext?.current?.timeline?.current?.timeline?.start?.getTime(),
      visualizerContext?.current?.timeline?.current?.timeline?.stop?.getTime(),
    ),
  );

  const onPause = useCallback(
    (committer?: TimelineCommitter) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "PAUSE",
        committer: { source: "storyTimelineBlock", id: committer?.id },
      });
    },
    [visualizerContext],
  );

  const onPlay = useCallback(
    (committer?: TimelineCommitter) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "PLAY",
        committer: { source: "storyTimelineBlock", id: committer?.id },
      });
    },
    [visualizerContext],
  );

  const onTimeChange = useCallback(
    (time: Date, committer?: TimelineCommitter) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          start: formatDateToSting(range?.start),
          current: time,
          stop: formatDateToSting(range.end),
        },
        committer: { source: "storyTimelineBlock", id: committer?.id },
      });
    },
    [range.end, range?.start, visualizerContext],
  );

  const onSpeedChange = useCallback(
    (speed: number, committer?: TimelineCommitter) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "SET_OPTIONS",
        payload: {
          multiplier: speed,
          stepType: "rate",
        },
        committer: { source: "storyTimelineBlock", id: committer?.id },
      });
    },
    [visualizerContext],
  );

  const onTick = useCallback(
    (cb: TickEventCallback) => visualizerContext?.current?.timeline?.current?.onTick(cb),
    [visualizerContext],
  );
  const removeTickEventListener = useCallback(
    (cb: TickEventCallback) => visualizerContext?.current?.timeline?.current?.offTick(cb),
    [visualizerContext],
  );

  const clockSpeed = visualizerContext?.current?.timeline?.current?.options.multiplier || 1;
  const startTime = visualizerContext?.current?.timeline?.current?.timeline?.start?.getTime();
  const stopTime = visualizerContext?.current?.timeline?.current?.timeline?.stop?.getTime();
  const [speed, setSpeed] = useState(clockSpeed);

  const lastTime = useRef<number>();
  const switchCurrentTimeToStart = useCallback(
    (t: number, isRangeChanged: boolean) => {
      const cur = isRangeChanged
        ? t
        : t > range?.end
        ? range?.start
        : t < range?.start
        ? range?.end
        : t;

      if (lastTime.current !== cur) {
        lastTime.current = cur;
        onTimeChange?.(new Date(cur));
      }
      if (timeValues.current)
        setRange(() =>
          timeRange(formatDateToUnix(timeValues?.start), formatDateToUnix(timeValues.stop)),
        );
      return cur;
    },
    [range?.end, range?.start, timeValues, onTimeChange],
  );

  const handleOnPlay = useCallback(
    (playing: boolean, committer: TimelineCommitter) => {
      // Stop cesium animation
      playing ? onPlay?.(committer) : onPause?.(committer);
      onSpeedChange?.(Math.abs(speed));
    },
    [onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnPlayReversed = useCallback(
    (playing: boolean, committer: TimelineCommitter) => {
      // Stop cesium animation
      playing ? onPlay?.(committer) : onPause?.(committer);
      onSpeedChange?.(Math.abs(speed) * -1);
    },
    [onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnPause = useCallback(
    (pause: boolean, committer: TimelineCommitter) => {
      pause && onPause?.(committer);
    },
    [onPause],
  );

  const handleTimeEvent: TimeHandler = useCallback(
    currentTime => {
      const t = new Date(currentTime);
      onTimeChange?.(t);
      setCurrentTime(currentTime);
    },
    [onTimeChange],
  );

  const handleOnSpeedChange = useCallback(
    (speed: number) => {
      setSpeed(speed);

      const absSpeed = Math.abs(speed);
      onSpeedChange?.(
        (visualizerContext?.current?.timeline?.current?.options.multiplier ?? 1) > 0
          ? absSpeed
          : absSpeed * -1,
      );
    },
    [onSpeedChange, visualizerContext],
  );

  const isClockInitialized = useRef(false);

  useEffect(() => {
    if (!isClockInitialized.current) {
      isClockInitialized.current = true;
      queueMicrotask(() => {
        onSpeedChange?.(1);
      });
    }
  }, [onSpeedChange]);

  const handleRange = useCallback((start: number | undefined, stop: number | undefined) => {
    setRange(prev => {
      const next = timeRange(start, stop);
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
  }, []);

  const overriddenStart =
    visualizerContext?.current?.timeline?.current?.computedTimeline?.start?.getTime();
  const overriddenStop =
    visualizerContext?.current?.timeline?.current?.computedTimeline?.stop.getTime();

  // Sync cesium clock.
  useEffect(() => {
    handleRange(overriddenStart ?? startTime, overriddenStop ?? stopTime);
    setSpeed(Math.abs(clockSpeed));
  }, [overriddenStart, overriddenStop, handleRange, startTime, stopTime, clockSpeed]);

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
    switchCurrentTimeToStart,
    handleRange,
    range.start,
    range.end,
    onTick,
    removeTickEventListener,
    timeValues?.start,
    timeValues.stop,
  ]);

  const onTimeChangeRef = useRef<typeof onTimeChange>();

  useEffect(() => {
    onTimeChangeRef.current = onTimeChange;
  }, [onTimeChange]);

  const overriddenCurrentTime =
    visualizerContext?.current?.timeline?.current?.computedTimeline?.current?.getTime();
  useEffect(() => {
    if (overriddenCurrentTime) {
      const t = Math.max(Math.min(range.end, overriddenCurrentTime), range.start);
      setCurrentTime(t);
    }
  }, [overriddenCurrentTime, range]);

  return {
    currentTime,
    range,
    speed,
    onClick: handleTimeEvent,
    onDrag: handleTimeEvent,
    onPlay: handleOnPlay,
    onPlayReversed: handleOnPlayReversed,
    onSpeedChange: handleOnSpeedChange,
    onPause: handleOnPause,
  };
};
