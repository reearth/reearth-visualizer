import { useCallback, useRef, useState, useMemo, MutableRefObject, RefObject } from "react";

import { convertTime } from "@reearth/beta/utils/time";

import { EngineRef } from ".";

type TimelineManager = {
  readonly timeline: EngineClock;
  readonly options: TimelineOptions;
  readonly computedTimeline: Timeline;
  commit: (commit: TimelineCommit) => void;
  onTick: TickEvent;
  offTick: TickEvent;
  onCommit: (cb: (committer: TimelineCommitter) => void) => void;
  offCommit: (cb: (committer: TimelineCommitter) => void) => void;
  handleTick: (d: Date, clock: { start: Date; stop: Date }) => void;
  tick: (() => Date | void | undefined) | undefined;
};

export type TimelineManagerRef = MutableRefObject<TimelineManager | undefined>;

export type Timeline = {
  current: Date;
  start: Date;
  stop: Date;
};

export type EngineClock = {
  current: Date | undefined;
  start: Date | undefined;
  stop: Date | undefined;
};

type TimelineOptions = {
  animation: boolean;
  stepType: "rate" | "fixed";
  multiplier: number;
  rangeType?: "unbounded" | "clamped" | "bounced";
};

type PlayCommand = {
  cmd: "PLAY";
};
type PauseCommand = {
  cmd: "PAUSE";
};
type SetTimeCommand = {
  cmd: "SET_TIME";
  payload: {
    current: Date | string;
    start: Date | string;
    stop: Date | string;
  };
};
type SetOptionsCommand = {
  cmd: "SET_OPTIONS";
  payload: Partial<Pick<TimelineOptions, "multiplier" | "rangeType" | "stepType">>;
};
export type TimelineCommit = (PlayCommand | PauseCommand | SetTimeCommand | SetOptionsCommand) & {
  committer: TimelineCommitter;
};

export type TimelineCommitter = {
  source:
    | "overrideSceneProperty"
    | "widgetContext"
    | "pluginAPI"
    | "featureResource"
    | "storyTimelineBlock"
    | "storyPage";
  id?: string;
};

export type TickEvent = (cb: TickEventCallback) => void;
export type TickEventCallback = (current: Date, clock: { start: Date; stop: Date }) => void;

const DEFAULT_RANGE = 86400000; // a day

type Props = {
  init?: {
    current?: string;
    start?: string;
    stop?: string;
    animation?: boolean;
    step?: number;
    stepType?: "rate" | "fixed";
    multiplier?: number;
    rangeType?: "unbounded" | "clamped" | "bounced";
  };
  engineRef?: RefObject<EngineRef>;
  timelineManagerRef?: TimelineManagerRef;
};

export default ({ init, engineRef, timelineManagerRef }: Props) => {
  const [time, setTime] = useState<Timeline>({
    start: convertTime(init?.start) ?? new Date(),
    stop: convertTime(init?.stop) ?? new Date(),
    current: convertTime(init?.current) ?? new Date(),
  });

  const [options, setOptions] = useState<TimelineOptions>({
    animation: init?.animation ?? false,
    stepType: init?.stepType ?? "rate",
    multiplier: init?.stepType === "fixed" ? init?.step ?? 1 : init?.multiplier ?? 1,
    rangeType: init?.rangeType ?? "unbounded",
  });

  const computedTimeline = useMemo(() => {
    const { start, stop, current } = time;
    const startTime = start.getTime();
    const stopTime = stop.getTime();
    const currentTime = current.getTime();

    const convertedStartTime = startTime > currentTime ? currentTime : startTime;
    const convertedStopTime = stopTime <= currentTime ? currentTime + DEFAULT_RANGE : stopTime;

    return {
      start: new Date(convertedStartTime),
      stop: new Date(convertedStopTime),
      current: new Date(currentTime),
    };
  }, [time]);

  const commit = useCallback((commit: TimelineCommit) => {
    if (!commit.cmd) return;

    if (commit.cmd === "PLAY") {
      setOptions(o => ({ ...o, animation: true }));
    } else if (commit.cmd === "PAUSE") {
      setOptions(o => ({ ...o, animation: false }));
    } else if (commit.cmd === "SET_TIME") {
      setTime(t => ({
        start: convertTime(commit.payload.start) ?? t.start,
        stop: convertTime(commit.payload.stop) ?? t.stop,
        current: convertTime(commit.payload.current) ?? t.current,
      }));
    } else if (commit.cmd === "SET_OPTIONS") {
      setOptions(o => ({
        ...o,
        stepType: commit.payload?.stepType === undefined ? o.stepType : commit.payload.stepType,
        multiplier:
          commit.payload?.multiplier === undefined ? o.multiplier : commit.payload.multiplier,
        rangeType: commit.payload?.rangeType === undefined ? o.rangeType : commit.payload.rangeType,
      }));
    }

    commitEventCallbacks.current.forEach(cb => cb(commit.committer));
  }, []);

  const tickEventCallbacks = useRef<TickEventCallback[]>([]);
  const onTick = useCallback((cb: TickEventCallback) => {
    tickEventCallbacks.current.push(cb);
  }, []);
  const offTick = useCallback((cb: TickEventCallback) => {
    tickEventCallbacks.current = tickEventCallbacks.current.filter(c => c !== cb);
  }, []);

  const commitEventCallbacks = useRef<((committer: TimelineCommitter) => void)[]>([]);
  const onCommit = useCallback((cb: (committer: TimelineCommitter) => void) => {
    commitEventCallbacks.current.push(cb);
  }, []);
  const offCommit = useCallback((cb: (committer: TimelineCommitter) => void) => {
    commitEventCallbacks.current = commitEventCallbacks.current.filter(c => c !== cb);
  }, []);

  const handleTick = useCallback(() => {
    tickEventCallbacks.current.forEach(cb => {
      const engineClock = engineRef?.current?.getClock();
      if (engineClock?.current && engineClock?.start && engineClock?.stop) {
        cb(engineClock.current, { start: engineClock?.start, stop: engineClock?.stop });
      }
    });
  }, [engineRef]);

  const timelineManager = useMemo(() => {
    return {
      timeline: {
        get start() {
          return engineRef?.current?.getClock()?.start;
        },
        get stop() {
          return engineRef?.current?.getClock()?.stop;
        },
        get current() {
          return engineRef?.current?.getClock()?.current;
        },
      },
      options,
      computedTimeline,
      commit,
      onTick,
      offTick,
      onCommit,
      offCommit,
      handleTick,
      tick: engineRef?.current?.tick,
    };
  }, [
    options,
    computedTimeline,
    engineRef,
    commit,
    onTick,
    offTick,
    onCommit,
    offCommit,
    handleTick,
  ]);

  if (timelineManagerRef) {
    timelineManagerRef.current = timelineManager;
  }

  return null;
};
