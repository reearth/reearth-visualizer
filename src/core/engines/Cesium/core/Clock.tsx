import { Clock as CesiumClock, ClockRange, ClockStep, JulianDate } from "cesium";
import { useCallback, useEffect, useMemo } from "react";
import { Clock, useCesium } from "resium";

import type { Clock as ClockType, SceneProperty } from "../..";

export type Props = {
  property?: SceneProperty;
  clock?: ClockType;
  onTick?: (d: Date, clock: { start: Date; stop: Date }) => void;
};

export default function ReearthClock({ property, clock, onTick }: Props): JSX.Element | null {
  const { animation, visible, stepType, rangeType, multiplier, step } = property?.timeline ?? {};
  const startTime = useMemo(
    () => (clock?.start ? JulianDate.fromDate(clock.start) : undefined),
    [clock?.start],
  );
  const stopTime = useMemo(
    () => (clock?.stop ? JulianDate.fromDate(clock?.stop) : undefined),
    [clock?.stop],
  );
  const currentTime = useMemo(
    () => (clock?.current ? JulianDate.fromDate(clock?.current) : undefined),
    [clock],
  );
  const clockStep =
    stepType === "fixed" ? ClockStep.TICK_DEPENDENT : ClockStep.SYSTEM_CLOCK_MULTIPLIER;
  const clockMultiplier = stepType === "fixed" ? step ?? 1 : multiplier ?? 1;

  const handleTick = useCallback(
    (clock: CesiumClock) => {
      // NOTE: Must not update state. This event will be called every frame.
      onTick?.(JulianDate.toDate(clock.currentTime), {
        start: JulianDate.toDate(clock.startTime),
        stop: JulianDate.toDate(clock.stopTime),
      });
    },
    [onTick],
  );

  const { viewer } = useCesium();
  useEffect(() => {
    if (!viewer) return;
    if (viewer.animation?.container) {
      (viewer.animation.container as HTMLDivElement).style.visibility = visible
        ? "visible"
        : "hidden";
    }
    if (viewer.timeline?.container) {
      (viewer.timeline.container as HTMLDivElement).style.visibility = visible
        ? "visible"
        : "hidden";
    }
    viewer.forceResize();
  }, [viewer, visible]);

  return (
    <Clock
      shouldAnimate={animation}
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
