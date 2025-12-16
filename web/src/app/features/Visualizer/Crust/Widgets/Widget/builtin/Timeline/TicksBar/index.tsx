import { FC, useEffect, useMemo, useRef, useState } from "react";

import { LABEL_WIDTH, TICK_GROUPS } from "./constants";
import Label from "./Label";
import Tick from "./Tick";
import { Duration } from "./types";
import { getOffsetedDateWithTimezone, getTicks } from "./utils";

type TicksBarProps = {
  startTime: number;
  endTime: number;
  timezone: string;
};

const TicksBar: FC<TicksBarProps> = ({ startTime, endTime, timezone }) => {
  const [fullWidth, setFullWidth] = useState(0);

  const trackWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries;
      let width: number | undefined;
      if (entry.borderBoxSize?.length > 0) {
        const borderBoxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;
        width = borderBoxSize.inlineSize;
      } else if (entry.contentRect) {
        width = entry.contentRect.width;
      } else {
        width = trackWrapperRef.current?.clientWidth;
      }
      setFullWidth(width ?? 0);
    });
    if (trackWrapperRef.current) {
      resizeObserver.observe(trackWrapperRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [trackWrapperRef]);

  const duration: Duration = useMemo(() => {
    const msStart = getOffsetedDateWithTimezone(startTime, timezone).getTime();
    const msEnd = getOffsetedDateWithTimezone(endTime, timezone).getTime();
    const msDuration = msEnd - msStart;
    return {
      msStart,
      msEnd,
      msDuration
    };
  }, [startTime, endTime, timezone]);

  const [tickGroups, maxLevel] = useMemo(() => {
    let innerMaxLevel = 0;
    const tg = TICK_GROUPS.map((type, i) => {
      const ticks = getTicks(duration, fullWidth, type.ms, type.unit, timezone);
      if (ticks.length > 0 && i > innerMaxLevel) innerMaxLevel = i;
      return {
        ticks,
        unit: type.unit
      };
    });
    return [tg, innerMaxLevel];
  }, [duration, fullWidth, timezone]);

  const dynamicMaxLevelLabels = useMemo(() => {
    let startPx = LABEL_WIDTH;
    const endPx = fullWidth - LABEL_WIDTH;
    const labels: { left: number; date: Date }[] = [];
    for (const tick of tickGroups[maxLevel].ticks) {
      const labelStartPx = (tick.left / 100) * fullWidth - LABEL_WIDTH / 2;
      if (labelStartPx > startPx && labelStartPx + LABEL_WIDTH < endPx) {
        startPx = labelStartPx + LABEL_WIDTH;
        labels.push({ left: tick.left, date: new Date(tick.ms) });
      }
    }
    return labels;
  }, [tickGroups, maxLevel, fullWidth]);

  return (
    <div
      className="absolute top-0 left-0 w-full h-full selection-none"
      ref={trackWrapperRef}
    >
      {tickGroups.map((tickGroup, level) => {
        return tickGroup.ticks.map((t, i) => (
          <Tick
            key={`${tickGroup.unit}-${i}`}
            left={t.left}
            level={3 - (maxLevel - level)}
          />
        ));
      })}
      <Label
        time={duration.msStart}
        left={0}
        timezone={timezone}
        level={maxLevel}
      />
      <Label
        time={duration.msEnd}
        left={100}
        timezone={timezone}
        level={maxLevel}
      />
      {dynamicMaxLevelLabels.map((label, i) => (
        <Label
          key={i}
          time={label.date.getTime()}
          left={label.left}
          timezone={timezone}
          level={maxLevel}
        />
      ))}
    </div>
  );
};

export default TicksBar;
