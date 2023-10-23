import { Clock as CesiumClock, ClockRange, ClockStep, JulianDate } from "cesium";
import { useCallback, useMemo } from "react";
import { Clock } from "resium";

import { TimelineManagerRef } from "../../../Map/useTimelineManager";

export type Props = {
  timelineManagerRef?: TimelineManagerRef;
};

export default function ReearthClock({ timelineManagerRef }: Props): JSX.Element | null {
  const { start, stop, current } = timelineManagerRef?.current?.computedTimeline ?? {};
  const { animation, stepType, rangeType, multiplier } = timelineManagerRef?.current?.options ?? {};

  const startTime = useMemo(() => (start ? JulianDate.fromDate(start) : undefined), [start]);
  const stopTime = useMemo(() => (stop ? JulianDate.fromDate(stop) : undefined), [stop]);
  const currentTime = useMemo(
    () => (current ? JulianDate.fromDate(current) : undefined),
    [current],
  );
  const clockStep =
    stepType === "fixed" ? ClockStep.TICK_DEPENDENT : ClockStep.SYSTEM_CLOCK_MULTIPLIER;
  const clockMultiplier = multiplier ?? 1;

  const handleTick = useCallback(
    (clock: CesiumClock) => {
      const start = JulianDate.toDate(clock.startTime);
      const stop = JulianDate.toDate(clock.stopTime);

      // NOTE: Must not update state. This event will be called every frame.
      timelineManagerRef?.current?.handleTick?.(JulianDate.toDate(clock.currentTime), {
        start,
        stop,
      });
    },
    [timelineManagerRef],
  );

  return (
    <Clock
      shouldAnimate={animation}
      canAnimate={animation}
      startTime={startTime}
      stopTime={stopTime}
      currentTime={currentTime}
      clockStep={clockStep}
      multiplier={clockMultiplier}
      clockRange={rangeType ? rangeTypes[rangeType] : undefined}
      onTick={handleTick}
    />
  );
}

const rangeTypes = {
  unbounded: ClockRange.UNBOUNDED,
  clamped: ClockRange.CLAMPED,
  bounced: ClockRange.LOOP_STOP,
};
