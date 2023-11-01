import { useCallback, useEffect, useMemo, useState } from "react";

import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";

import { TickEventCallback, TimelineCommitter } from "../../Map/useTimelineManager";
import { TimelineValues } from "../Block/builtin/Timeline";
import { convertOptionToSeconds, formatDateToSting } from "../utils";

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

export default (timelineValues?: TimelineValues, blockId?: string) => {
  const visualizerContext = useVisualizer();

  const playSpeedOptions = useMemo(() => {
    const speedOpt = ["1min/sec", "0.1hr/sec", "0.5hr/sec", "1hr/sec"];
    return convertOptionToSeconds(speedOpt);
  }, []);

  const [speed, setSpeed] = useState(playSpeedOptions[0].seconds);

  const range = useMemo(() => {
    if (timelineValues) {
      const startTime = getNewDate(new Date(timelineValues?.startTime.substring(0, 19))).getTime();
      const endTime = getNewDate(new Date(timelineValues?.endTime.substring(0, 19))).getTime();
      return timeRange(startTime, endTime);
    } else {
      return timeRange(
        visualizerContext?.current?.timeline?.current?.timeline?.start?.getTime(),
        visualizerContext?.current?.timeline?.current?.timeline?.stop?.getTime(),
      );
    }
  }, [timelineValues, visualizerContext]);

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
    (time: Date, committerId?: string) => {
      if (!range) return;
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          start: formatDateToSting(range.start),
          current: time,
          stop: formatDateToSting(range.end),
        },
        committer: { source: "storyTimelineBlock", id: committerId },
      });
    },
    [range, visualizerContext],
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

  const handleTimeEvent = useCallback(
    (currentTime: Date, blockId: string) => {
      const t = new Date(currentTime);
      onTimeChange?.(t, blockId);
    },
    [onTimeChange],
  );

  const currentTime = useMemo(() => {
    if (timelineValues) {
      const t = getNewDate(new Date(timelineValues?.currentTime.substring(0, 19))).getTime();
      blockId && handleTimeEvent?.(new Date(t), blockId);
      return t;
    } else {
      return getNewDate(visualizerContext?.current?.timeline?.current?.timeline?.current).getTime();
    }
  }, [blockId, handleTimeEvent, timelineValues, visualizerContext]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingReversed, setIsPlayingReversed] = useState(false);

  const handleTick = useCallback(
    (current: Date) => {
      if (!isPlaying || !isPlayingReversed) current;
    },
    [isPlaying, isPlayingReversed],
  );

  useEffect(() => {
    onTick?.(handleTick);
    return () => {
      removeTickEventListener?.(handleTick);
    };
  }, [handleTick, onTick, removeTickEventListener]);

  return {
    currentTime,
    range,
    playSpeedOptions,
    isPlaying,
    isPlayingReversed,
    onPlay: handleOnPlay,
    onPlayReversed: handleOnPlayReversed,
    onSpeedChange: handleOnSpeedChange,
    onPause: handleOnPause,
    setIsPlaying,
    setIsPlayingReversed,
  };
};
