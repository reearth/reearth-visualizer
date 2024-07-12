import { useCallback } from "react";

import { Props } from "../types";

export default ({ timelineManagerRef }: Pick<Props, "timelineManagerRef">) => {
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
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      pause: () => {
        timelineManagerRef?.current?.commit({
          cmd: "PAUSE",
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setTime: (time: { start: Date | string; stop: Date | string; current: Date | string }) => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_TIME",
          payload: { ...time },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setSpeed: (speed: number) => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { multiplier: speed },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setStepType: (stepType: "rate" | "fixed") => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { stepType },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setRangeType: (rangeType: "unbounded" | "clamped" | "bounced") => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { rangeType },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      tick: timelineManagerRef?.current?.tick,
    };
  }, [timelineManagerRef]);

  return {
    getTimeline,
  };
};
