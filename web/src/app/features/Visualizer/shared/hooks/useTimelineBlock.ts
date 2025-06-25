import { getTimeZone } from "@reearth/app/utils/time";
import {
  useVisualizer,
  TickEventCallback,
  TimelineCommitter
} from "@reearth/core";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TimelineValues } from "../../Crust/StoryPanel/Block/builtin/Timeline";
import {
  formatDateToSting,
  formatISO8601,
  formatTimezone
} from "../../Crust/StoryPanel/utils";

export const getNewDate = (d?: Date) => d ?? new Date();

const calculateEndTime = (date: Date) => {
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

const calculateMidTime = (startTime: number, stopTime: number) => {
  return (startTime + stopTime) / 2;
};

const playSpeedOptions = [
  { timeString: "1sec/sec", seconds: 1 },
  { timeString: "0.5min/sec", seconds: 30 },
  { timeString: "1min/sec", seconds: 60 },
  { timeString: "0.1hr/sec", seconds: 360 },
  { timeString: "0.5hr/sec", seconds: 1800 },
  { timeString: "1hr/sec", seconds: 3600 }
];

const TRANSITION_SPEED = 0;

const timeRange = (startTime?: number, stopTime?: number) => {
  // To avoid out of range error in Cesium, we need to turn back a hour.
  const now = Date.now() - 3600000;
  return {
    start: startTime || now,
    end: stopTime || stopTime || calculateEndTime(new Date()),
    mid: calculateMidTime(
      startTime || now,
      stopTime || calculateEndTime(new Date())
    )
  };
};

export default (timelineValues?: TimelineValues) => {
  const visualizerContext = useVisualizer();

  const [speed, setSpeed] = useState(playSpeedOptions[0].seconds);

  const [currentTime, setCurrentTime] = useState(
    getNewDate(
      visualizerContext?.current?.timeline?.current?.timeline?.current
    ).getTime()
  );

  const [timezone, setTimezone] = useState<string>(formatTimezone(currentTime));

  const range = useMemo(() => {
    if (timelineValues) {
      const startTime = getNewDate(
        new Date(formatISO8601(timelineValues?.startTime))
      ).getTime();
      const endTime = getNewDate(
        new Date(formatISO8601(timelineValues?.endTime))
      ).getTime();
      return timeRange(startTime, endTime);
    } else {
      return timeRange(
        visualizerContext?.current?.timeline?.current?.timeline?.start?.getTime(),
        visualizerContext?.current?.timeline?.current?.timeline?.stop?.getTime()
      );
    }
  }, [timelineValues, visualizerContext]);

  const onPause = useCallback(
    (committerId?: string) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "PAUSE",
        committer: { source: "storyTimelineBlock", id: committerId }
      });
    },
    [visualizerContext]
  );

  const onPlay = useCallback(
    (committer?: TimelineCommitter) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "PLAY",
        committer: { source: "storyTimelineBlock", id: committer?.id }
      });
    },
    [visualizerContext]
  );

  const onTimeChange = useCallback(
    (time: Date, committerId?: string) => {
      if (!range) return;
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          start: formatDateToSting(range.start),
          current: time,
          stop: formatDateToSting(range.end)
        },
        committer: { source: "storyTimelineBlock", id: committerId }
      });
    },
    [range, visualizerContext]
  );

  const onSpeedChange = useCallback(
    (speed: number, committerId?: string) => {
      return visualizerContext.current?.timeline?.current?.commit({
        cmd: "SET_OPTIONS",
        payload: {
          multiplier: speed,
          stepType: "rate"
        },
        committer: { source: "storyTimelineBlock", id: committerId }
      });
    },
    [visualizerContext]
  );

  const onTick = useCallback(
    (cb: TickEventCallback) =>
      visualizerContext?.current?.timeline?.current?.onTick(cb),
    [visualizerContext]
  );
  const removeTickEventListener = useCallback(
    (cb: TickEventCallback) =>
      visualizerContext?.current?.timeline?.current?.offTick(cb),
    [visualizerContext]
  );

  const removeOnCommitEventListener = useCallback(
    (cb: (committer: TimelineCommitter) => void) =>
      visualizerContext?.current?.timeline?.current?.offCommit(cb),
    [visualizerContext]
  );

  const onCommit = useCallback(
    (cb: (committer: TimelineCommitter) => void) =>
      visualizerContext?.current?.timeline?.current?.onCommit(cb),
    [visualizerContext]
  );

  const handleOnSpeedChange = useCallback(
    (speed: number, committerId?: string) => {
      try {
        onSpeedChange(TRANSITION_SPEED, committerId);
        setTimeout(() => {
          onSpeedChange(speed, committerId);
          setSpeed(speed);
        }, 0);
      } catch (error) {
        setSpeed(playSpeedOptions[0].seconds);
        throw error;
      }
    },
    [onSpeedChange]
  );

  useEffect(() => {
    if (timelineValues) {
      const iso8601Time = formatISO8601(timelineValues?.currentTime);
      const t = getNewDate(new Date(iso8601Time)).getTime();
      const timezoneOffset = getTimeZone(iso8601Time);
      setTimezone(timezoneOffset ?? "");
      return setCurrentTime(t);
    } else {
      return setCurrentTime(
        getNewDate(
          visualizerContext?.current?.timeline?.current?.timeline?.current
        ).getTime()
      );
    }
  }, [timelineValues, visualizerContext]);

  return {
    currentTime,
    range,
    playSpeedOptions,
    speed,
    timezone,
    onPlay,
    onSpeedChange: handleOnSpeedChange,
    onPause,
    onTimeChange,
    onTick,
    removeTickEventListener,
    onCommit,
    removeOnCommitEventListener,
    setCurrentTime
  };
};
