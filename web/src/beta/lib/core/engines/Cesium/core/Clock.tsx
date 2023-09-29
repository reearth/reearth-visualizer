import { Clock as CesiumClock, ClockRange, ClockStep, JulianDate } from "cesium";
import { useCallback, useEffect, useMemo } from "react";
import { Clock, useCesium } from "resium";

import type { SceneProperty } from "../..";
import { type TimelineManager } from "../../../Visualizer/useTimelineManager";

export type Props = {
  property?: SceneProperty;
  timelineManager?: TimelineManager;
};

export default function ReearthClock({ property, timelineManager }: Props): JSX.Element | null {
  const { visible } = property?.timeline ?? {};
  const { start, stop, current, animation, stepType, rangeType, multiplier, step } =
    timelineManager?.overriddenTimeline ?? {};
  console.log("aaa", animation);
  const startTime = useMemo(() => (start ? JulianDate.fromDate(start) : undefined), [start]);
  const stopTime = useMemo(() => (stop ? JulianDate.fromDate(stop) : undefined), [stop]);
  const currentTime = useMemo(
    () => (current ? JulianDate.fromDate(current) : undefined),
    [current],
  );
  const clockStep =
    stepType === "fixed" ? ClockStep.TICK_DEPENDENT : ClockStep.SYSTEM_CLOCK_MULTIPLIER;
  const clockMultiplier = stepType === "fixed" ? step ?? 1 : multiplier ?? 1;

  const { viewer } = useCesium();

  const handleTick = useCallback(
    (clock: CesiumClock) => {
      const start = JulianDate.toDate(clock.startTime);
      const stop = JulianDate.toDate(clock.stopTime);

      // NOTE: Must not update state. This event will be called every frame.
      timelineManager?.handleTick?.(JulianDate.toDate(clock.currentTime), {
        start,
        stop,
      });
    },
    [timelineManager],
  );

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

  console.log("animation", animation);

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
