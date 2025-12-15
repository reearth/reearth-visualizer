import { useCallback, useRef } from "react";

export default ({
  startTime,
  endTime
}: {
  startTime: number;
  endTime: number;
}) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  const updateIndicatorPosition = useCallback(
    (newTime: number) => {
      if (!indicatorRef.current) return;

      const inRange = newTime >= startTime && newTime <= endTime;
      indicatorRef.current.style.display = inRange ? "block" : "none";

      const clampedTime = Math.max(startTime, Math.min(newTime, endTime));
      const leftPercent =
        ((clampedTime - startTime) / (endTime - startTime)) * 100;
      indicatorRef.current.style.left = `${leftPercent}%`;
    },
    [startTime, endTime]
  );

  return {
    indicatorRef,
    updateIndicatorPosition
  };
};
