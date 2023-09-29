import { useCallback, useRef, useState, useMemo } from "react";

import { convertTime, truncMinutes } from "@reearth/beta/utils/time";

import { EngineRef, WrappedRef } from "../Map";

export type TimelineManager = {
  readonly timeline: Timeline;
  readonly overriddenTimeline: Timeline;
  commit: (props: TimelineCommit) => void;
  onTick: TickEvent;
  offTick: TickEvent;
  onCommiterChange: (cb: () => void) => void;
  offCommiterChange: (cb: () => void) => void;
  // for connect engine onTick
  handleTick: (d: Date, clock: { start: Date; stop: Date }) => void;
  tick: (() => Date | void | undefined) | undefined;
};

export type Timeline = TimeDate & TimelineOptions;

type TimeDate = {
  current?: Date;
  start?: Date;
  stop?: Date;
};

type TimelineOptions = {
  animation: boolean;
  step: number;
  stepType: "rate" | "fixed";
  multiplier: number;
  rangeType?: "unbounded" | "clamped" | "bounced";
};

type TimelineCommand = "PLAY" | "PAUSE" | "UPDATE";

type TimelineCommit = {
  cmd: TimelineCommand;
  payload?:
    | ({
        current?: Date | string | undefined;
        start?: Date | string | undefined;
        stop?: Date | string | undefined;
      } & Partial<TimelineOptions>)
    | undefined;
  commiter: TimelineCommiter;
};

export type TimelineCommiter = {
  source: "overrideSceneProperty" | "widgetContext" | "pluginAPI";
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
  } & Partial<TimelineOptions>;
  engineRef?: WrappedRef<EngineRef>;
};

export default ({ init, engineRef }: Props) => {
  const [time, setTime] = useState<TimeDate>({
    start: convertTime(init?.start),
    stop: convertTime(init?.stop),
    current: convertTime(init?.current),
  });

  const [options, setOptions] = useState<TimelineOptions>({
    animation: init?.animation ?? false,
    step: init?.step ?? 1,
    stepType: init?.stepType ?? "rate",
    multiplier: init?.multiplier ?? 1,
    rangeType: init?.rangeType ?? "unbounded",
  });

  const validTimes = useMemo(() => {
    const { start, stop, current } = time;
    const startTime = start?.getTime();
    const stopTime = stop?.getTime();
    const currentTime = current?.getTime();

    // TODO: validate time
    const now = Date.now();

    const convertedStartTime = startTime
      ? Math.min(now, startTime)
      : stopTime
      ? Math.min(now, stopTime - DEFAULT_RANGE)
      : now - DEFAULT_RANGE;

    const convertedStopTime = stopTime
      ? Math.max(stopTime, now)
      : startTime
      ? Math.max(now, startTime + DEFAULT_RANGE)
      : now;

    return {
      start: truncMinutes(new Date(convertedStartTime)),
      stop: new Date(convertedStopTime),
      current: new Date(
        Math.max(
          Math.min(currentTime || convertedStartTime, convertedStopTime),
          convertedStartTime,
        ),
      ),
    };
  }, [time]);

  // Commiter Record
  const lastCommiter = useRef<TimelineCommiter>();

  const commit = useCallback(({ cmd, payload, commiter }: TimelineCommit) => {
    console.log("commit", cmd, payload, commiter);
    if (!cmd) return;

    if (cmd === "UPDATE") {
      setTime(t => ({
        start: payload?.start === undefined ? t.start : convertTime(payload?.start),
        stop: payload?.stop === undefined ? t.stop : convertTime(payload?.stop),
        current: payload?.current === undefined ? t.current : convertTime(payload?.current),
      }));
      setOptions(o => ({
        animation: payload?.animation === undefined ? o.animation : payload.animation,
        step: payload?.step === undefined ? o.step : payload.step,
        stepType: payload?.stepType === undefined ? o.stepType : payload.stepType,
        multiplier: payload?.multiplier === undefined ? o.multiplier : payload.multiplier,
        rangeType: payload?.rangeType === undefined ? o.rangeType : payload.rangeType,
      }));
    } else if (cmd === "PLAY") {
      setOptions(o => ({ ...o, animation: true }));
    } else if (cmd === "PAUSE") {
      setOptions(o => ({ ...o, animation: false }));
    }

    // Last commiter
    if (
      lastCommiter.current &&
      (commiter.source !== lastCommiter.current.source || commiter.id !== lastCommiter.current.id)
    ) {
      commiterChangeEventCallbacks.current.forEach(cb => cb());
    }
    lastCommiter.current = commiter;
  }, []);

  const tickEventCallbacks = useRef<TickEventCallback[]>([]);
  const onTick = useCallback((cb: TickEventCallback) => {
    tickEventCallbacks.current.push(cb);
  }, []);
  const offTick = useCallback((cb: TickEventCallback) => {
    tickEventCallbacks.current = tickEventCallbacks.current.filter(c => c !== cb);
  }, []);

  const commiterChangeEventCallbacks = useRef<(() => void)[]>([]);
  const onCommiterChange = useCallback((cb: () => void) => {
    commiterChangeEventCallbacks.current.push(cb);
  }, []);
  const offCommiterChange = useCallback((cb: () => void) => {
    commiterChangeEventCallbacks.current = commiterChangeEventCallbacks.current.filter(
      c => c !== cb,
    );
  }, []);

  const handleTick = useCallback(() => {
    console.log("handleTick");
    tickEventCallbacks.current.forEach(cb => {
      const engineClock = engineRef?.getClock();
      if (engineClock?.current && engineClock?.start && engineClock?.stop) {
        cb(engineClock.current, { start: engineClock?.start, stop: engineClock?.stop });
      }
    });
  }, [engineRef]);

  const timelineManager = useMemo(() => {
    const engineClock = engineRef?.getClock();
    return {
      get timeline() {
        return {
          get start() {
            return engineClock?.start;
          },
          get stop() {
            return engineClock?.stop;
          },
          get current() {
            return engineClock?.current;
          },
          get animation() {
            return options.animation;
          },
          get step() {
            return options.step;
          },
          get stepType() {
            return options.stepType;
          },
          get multiplier() {
            return options.multiplier;
          },
          get rangeType() {
            return options.rangeType;
          },
        };
      },
      overriddenTimeline: {
        ...validTimes,
        ...options,
      },
      commit,
      onTick,
      offTick,
      onCommiterChange,
      offCommiterChange,
      handleTick,
      tick: engineRef?.tick,
    };
  }, [
    options,
    validTimes,
    engineRef,
    commit,
    onTick,
    offTick,
    onCommiterChange,
    offCommiterChange,
    handleTick,
  ]);

  return timelineManager;
};
