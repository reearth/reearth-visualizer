import { useState } from "react";

import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";

const getNewDate = (d?: Date) => d ?? new Date();

const calculateEndTime = (date: Date) => {
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

const calculateMidTime = (startTime: number, stopTime: number) => {
  return (startTime + stopTime) / 2;
};

const timeRange = (startTime?: number, stopTime?: number) => {
  // To avoid out of range error in Cesium, we need to turn back a hour.
  const now = Date.now() - 3600000;
  return {
    start: startTime || now,
    end: stopTime || calculateEndTime(new Date()),
    mid: calculateMidTime(startTime || now, stopTime || calculateEndTime(new Date())),
  };
};
export default () => {
  const visualizerContext = useVisualizer();
  const [currentTime] = useState(() =>
    getNewDate(visualizerContext?.current?.timeline?.current?.timeline?.current)?.getTime(),
  );

  const [range] = useState(() =>
    timeRange(
      visualizerContext?.current?.timeline?.current?.timeline?.start?.getTime(),
      visualizerContext?.current?.timeline?.current?.timeline?.stop?.getTime(),
    ),
  );

  return {
    currentTime,
    range,
  };
};
