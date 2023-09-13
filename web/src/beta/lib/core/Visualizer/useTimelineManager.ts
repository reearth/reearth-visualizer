import { useCallback, useRef, useState, useMemo } from "react";

import { convertTime, truncMinutes } from "@reearth/beta/utils/time";

import { Clock } from "../Map";

export type TimelineManager = {
  readonly timeline: Timeline;
  readonly overriddenTimeline: Timeline;
  commit: (props: TimelineCommit) => void;
  on: (type: TimelineEventTypes, cb: () => void, commiter: TimelineCommiter) => void;
  off: (type: TimelineEventTypes, cb: () => void, commiter: TimelineCommiter) => void;
  // for connect engine onTick
  onTick: (d: Date, clock: { start: Date; stop: Date }) => void;
};

export type Timeline = TimeDate & TimelineOptions;
type TimeDate = {
  current?: Date;
  start?: Date;
  stop?: Date;
};

type TimelineData = TimeString & TimelineOptions;
type TimeString = {
  current?: string;
  start?: string;
  stop?: string;
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
  payload: Partial<TimelineData> | undefined;
  commiter: TimelineCommiter;
};

type TimelineCommiter = {
  source: "overrideSceneProperty";
  id?: string;
};

type TimelineEventTypes = "commiterchange" | "tick";

const DEFAULT_RANGE = 86400000; // a day

type Props = {
  init?: Partial<TimelineData>;
  engineClock?: Clock;
};

export default ({ init, engineClock }: Props) => {
  const [time, setTime] = useState<TimeString>({
    start: init?.start,
    stop: init?.stop,
    current: init?.current,
  });

  const [options, setOptions] = useState<TimelineOptions>({
    animation: init?.animation ?? false,
    step: init?.step ?? 1,
    stepType: init?.stepType ?? "rate",
    multiplier: init?.multiplier ?? 1,
    rangeType: init?.rangeType ?? "unbounded",
  });

  const timeDates = useMemo(() => {
    const { start, stop, current } = time;
    const startTime = convertTime(start)?.getTime();
    const stopTime = convertTime(stop)?.getTime();
    const currentTime = convertTime(current)?.getTime();

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
    if (!cmd) return;

    if (cmd === "UPDATE") {
      setTime({ start: payload?.start, stop: payload?.stop, current: payload?.current });
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
      eventCallbacks.current.commiterchange.forEach(c => c.cb());
    }
    lastCommiter.current = commiter;
  }, []);

  const eventCallbacks = useRef<{
    [key in TimelineEventTypes]: { commiter: TimelineCommiter; cb: () => void }[];
  }>({ tick: [], commiterchange: [] });

  const on = useCallback((type: TimelineEventTypes, cb: () => void, commiter: TimelineCommiter) => {
    if (type !== "tick" && type !== "commiterchange") return;
    eventCallbacks.current[type].push({ commiter, cb });
  }, []);

  const off = useCallback(
    (type: TimelineEventTypes, cb: () => void, commiter: TimelineCommiter) => {
      if (type !== "tick" && type !== "commiterchange") return;
      eventCallbacks.current[type] = eventCallbacks.current[type].filter(
        c =>
          !(c.commiter.source === commiter.source && c.commiter.id === commiter.id && c.cb === cb),
      );
    },
    [],
  );

  const onTick = useCallback(() => {
    eventCallbacks.current.tick.forEach(c => c.cb());
  }, []);

  const timelineManager = useMemo(
    () => ({
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
        ...timeDates,
        ...options,
      },
      commit,
      on,
      off,
      onTick,
    }),
    [engineClock, options, timeDates, commit, off, on, onTick],
  );

  return timelineManager;
};
