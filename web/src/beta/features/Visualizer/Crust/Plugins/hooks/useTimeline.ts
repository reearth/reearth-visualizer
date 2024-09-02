import { useCallback, useEffect, useMemo } from "react";

import { TimelineEventType } from "../pluginAPI/types";
import { Props } from "../types";
import { events } from "../utils/events";

export default ({ timelineManagerRef }: Pick<Props, "timelineManagerRef">) => {
  // events
  const [timelineEvents, emit] = useMemo(() => events<TimelineEventType>(), []);

  useEffect(() => {
    timelineManagerRef?.current?.onTick((e) => {
      emit("tick", e);
    });
  }, [timelineManagerRef, emit]);

  useEffect(() => {
    timelineManagerRef?.current?.onCommit((e) => {
      emit("commit", e);
    });
  }, [timelineManagerRef, emit]);

  const timelineEventsOn = useCallback(
    <T extends keyof TimelineEventType>(
      type: T,
      callback: (...args: TimelineEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? timelineEvents.once(type, callback)
        : timelineEvents.on(type, callback);
    },
    [timelineEvents]
  );

  const timelineEventsOff = useCallback(
    <T extends keyof TimelineEventType>(
      type: T,
      callback: (...args: TimelineEventType[T]) => void
    ) => {
      return timelineEvents.off(type, callback);
    },
    [timelineEvents]
  );

  // timeline
  const getTimeline = useCallback(() => {
    return {
      get startTime() {
        return timelineManagerRef?.current?.timeline?.start;
      },
      get stopTime() {
        return timelineManagerRef?.current?.timeline?.stop;
      },
      get currentTime() {
        return timelineManagerRef?.current?.timeline?.current;
      },
      get isPlaying() {
        return !!timelineManagerRef?.current?.options?.animation;
      },
      get speed() {
        return timelineManagerRef?.current?.options?.multiplier;
      },
      get stepType() {
        return timelineManagerRef?.current?.options?.stepType;
      },
      get rangeType() {
        return timelineManagerRef?.current?.options?.rangeType;
      },
      play: () => {
        timelineManagerRef?.current?.commit({
          cmd: "PLAY",
          committer: { source: "pluginAPI", id: "window" }
        });
      },
      pause: () => {
        timelineManagerRef?.current?.commit({
          cmd: "PAUSE",
          committer: { source: "pluginAPI", id: "window" }
        });
      },
      setTime: (time: {
        start: Date | string;
        stop: Date | string;
        current: Date | string;
      }) => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_TIME",
          payload: { ...time },
          committer: { source: "pluginAPI", id: "window" }
        });
      },
      setSpeed: (speed: number) => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { multiplier: speed },
          committer: { source: "pluginAPI", id: "window" }
        });
      },
      setStepType: (stepType: "rate" | "fixed") => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { stepType },
          committer: { source: "pluginAPI", id: "window" }
        });
      },
      setRangeType: (rangeType: "unbounded" | "clamped" | "bounced") => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { rangeType },
          committer: { source: "pluginAPI", id: "window" }
        });
      },
      tick: timelineManagerRef?.current?.tick as
        | (() => Date | undefined)
        | undefined,
      on: timelineEventsOn,
      off: timelineEventsOff
    };
  }, [timelineManagerRef, timelineEventsOn, timelineEventsOff]);

  return {
    getTimeline,
    timelineEvents
  };
};
