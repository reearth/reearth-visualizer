import { useCallback, useEffect, useMemo, useState } from "react";

import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";

import { TickEventCallback, TimelineCommitter } from "../../Map/useTimelineManager";
import { TimelineValues } from "../Block/builtin/Timeline";
import { convertOptionToSeconds, formatDateToSting } from "../utils";

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
    end: stopTime || stopTime || calculateEndTime(new Date()),
    mid: calculateMidTime(startTime || now, stopTime || calculateEndTime(new Date())),
  };
};

export default (timelineValues?: TimelineValues) => {
  const visualizerContext = useVisualizer();

  const [currentTime, setCurrentTime] = useState(
    getNewDate(visualizerContext?.current?.timeline?.current?.timeline?.current).getTime(),
  );
  const [range, setRange] = useState(
    timeRange(
      visualizerContext?.current?.timeline?.current?.timeline?.start?.getTime(),
      visualizerContext?.current?.timeline?.current?.timeline?.stop?.getTime(),
    ),
  );
  const playSpeedOptions = useMemo(() => {
    const speedOpt = ["1min/sec", "0.1hr/sec", "0.5hr/sec", "1hr/sec"];
    return convertOptionToSeconds(speedOpt);
  }, []);

  const [speed, setSpeed] = useState(playSpeedOptions[0].seconds);

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
          stop: formatDateToSting(range?.end),
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

  const handleOnSpeedChange = useCallback(
    (speed: number) => {
      const absSpeed = Math.abs(speed);
      onSpeedChange?.(absSpeed);
      setSpeed(speed);
    },
    [onSpeedChange],
  );

  const handleOnPlay = useCallback(
    (playing: boolean, committer: TimelineCommitter) => {
      playing ? onPlay?.(committer) : onPause?.(committer);
      onSpeedChange?.(Math.abs(speed));
    },
    [onPause, onPlay, onSpeedChange, speed],
  );

  const handleOnPlayReversed = useCallback(
    (playing: boolean, committer: TimelineCommitter) => {
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

  const handleRange = useCallback((start: number | undefined, stop: number | undefined) => {
    setRange(prev => {
      const next = timeRange(start, stop);
      if (prev.start !== next.start || prev.end !== next.end) {
        return next;
      }
      return prev;
    });
  }, []);

  // update block time setting.
  useEffect(() => {
    if (timelineValues?.currentTime || timelineValues?.startTime || timelineValues?.endTime) {
      const startTime = getNewDate(new Date(timelineValues?.startTime.substring(0, 19))).getTime();
      const endTime = getNewDate(new Date(timelineValues?.endTime.substring(0, 19))).getTime();
      setCurrentTime(prev => {
        const next = getNewDate(new Date(timelineValues?.currentTime.substring(0, 19))).getTime();
        if (prev !== next) {
          onTimeChange?.(new Date(next));
        }
        return prev;
      });
      return handleRange(startTime, endTime);
    }
  }, [
    handleRange,
    timelineValues?.startTime,
    timelineValues?.endTime,
    timelineValues,
    onTimeChange,
  ]);

  useEffect(() => {
    const switchCurrentTimeToStart = (t: number, isRangeChanged: boolean) => {
      if (isRangeChanged) {
        return t;
      } else {
        return Math.min(Math.max(t, range.start), range.end);
      }
    };

    const h: TickEventCallback = (d, c) => {
      const isDifferentRange = range.start !== c.start.getTime() || range.end !== c.stop.getTime();
      setCurrentTime(switchCurrentTimeToStart(d.getTime(), isDifferentRange));
    };
    if (range.start !== currentTime || range.end !== currentTime) {
      onTick?.(h);
    }

    return () => {
      removeTickEventListener?.(h);
    };
  }, [handleRange, range.start, range.end, onTick, removeTickEventListener, currentTime]);

  return {
    currentTime,
    range,
    playSpeedOptions,
    onClick: handleTimeEvent,
    onDrag: handleTimeEvent,
    onPlay: handleOnPlay,
    onPlayReversed: handleOnPlayReversed,
    onSpeedChange: handleOnSpeedChange,
    onPause: handleOnPause,
  };
};
