import { useCallback, useRef, useState, useMemo, MutableRefObject, RefObject } from "react";

import { convertTime } from "@reearth/beta/utils/time";

import { EngineRef } from ".";

export type TimelineManager = {
  readonly timeline: Timeline;
  readonly options: TimelineOptions;
  readonly computedTimeline: Timeline;
  commit: (props: TimelineCommit) => void;
  onTick: TickEvent;
  offTick: TickEvent;
  onCommit: (cb: (committer: TimelineCommitter) => void) => void;
  offCommit: (cb: (committer: TimelineCommitter) => void) => void;
  handleTick: (d: Date, clock: { start: Date; stop: Date }) => void;
  tick: (() => Date | void | undefined) | undefined;
};

export type TimelineManagerRef = MutableRefObject<TimelineManager | undefined>;

export type Timeline = {
  current?: Date;
  start?: Date;
  stop?: Date;
};

type TimelineOptions = {
  animation: boolean;
  stepType: "rate" | "fixed";
  multiplier: number;
  rangeType?: "unbounded" | "clamped" | "bounced";
};

type TimelineCommand = "PLAY" | "PAUSE" | "SET_TIME" | "SET_OPTIONS";

type TimelineCommit = {
  cmd: TimelineCommand;
  payload?:
    | ({
        current?: Date | string | undefined;
        start?: Date | string | undefined;
        stop?: Date | string | undefined;
      } & Partial<TimelineOptions>)
    | undefined;
  committer: TimelineCommitter;
};

export type TimelineCommitter = {
  source: "overrideSceneProperty" | "widgetContext" | "pluginAPI" | "featureResource";
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
    start: convertTime(init?.start),
    stop: convertTime(init?.stop),
    current: convertTime(init?.current),
  });

  const [options, setOptions] = useState<TimelineOptions>({
    animation: init?.animation ?? false,
    stepType: init?.stepType ?? "rate",
    multiplier: init?.stepType === "fixed" ? init?.step ?? 1 : init?.multiplier ?? 1,
    rangeType: init?.rangeType ?? "unbounded",
  });

  const computedTimeline = useMemo(() => {
    const { start, stop, current } = time;
    const startTime = start?.getTime() ?? new Date().getTime();
    const stopTime = stop?.getTime() ?? new Date().getTime();
    const currentTime = current?.getTime() ?? new Date().getTime();

    const convertedStartTime = startTime > currentTime ? currentTime : startTime;
    const convertedStopTime = stopTime <= currentTime ? currentTime + DEFAULT_RANGE : stopTime;

    return {
      start: new Date(convertedStartTime),
      stop: new Date(convertedStopTime),
      current: new Date(currentTime),
    };
  }, [time]);

  const commit = useCallback(({ cmd, payload, committer }: TimelineCommit) => {
    if (!cmd) return;

    if (cmd === "PLAY") {
      setOptions(o => ({ ...o, animation: true }));
    } else if (cmd === "PAUSE") {
      setOptions(o => ({ ...o, animation: false }));
    } else if (cmd === "SET_TIME") {
      setTime(t => ({
        start: payload?.start === undefined ? t.start : convertTime(payload?.start),
        stop: payload?.stop === undefined ? t.stop : convertTime(payload?.stop),
        current: payload?.current === undefined ? t.current : convertTime(payload?.current),
      }));
    } else if (cmd === "SET_OPTIONS") {
      setOptions(o => ({
        ...o,
        stepType: payload?.stepType === undefined ? o.stepType : payload.stepType,
        multiplier: payload?.multiplier === undefined ? o.multiplier : payload.multiplier,
        rangeType: payload?.rangeType === undefined ? o.rangeType : payload.rangeType,
      }));
    }

    commitEventCallbacks.current.forEach(cb => cb(committer));
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

  return timelineManager;
};
