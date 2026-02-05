import { formatTimeInTimezone } from "../utils";

import { MIN_TICK_WIDTH } from "./constants";
import { Duration, TickUnit } from "./types";

export const getTicks = (
  duration: Duration,
  fullWidth: number,
  msStep: number,
  unit: TickUnit,
  timezone: string
) => {
  if (duration.msDuration <= msStep) return [];
  const stepPx = fullWidth / (duration.msDuration / msStep);
  if (stepPx < MIN_TICK_WIDTH) return [];
  const ticks: { left: number; ms: number }[] = [];
  if (unit === "month") {
    const date = new Date(duration.msStart);
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    const timezoneHours = parseTimezoneOffsetToMs(timezone) / (60 * 60 * 1000);
    date.setHours(timezoneHours);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Need to check the start since we consider timezone in hours
    if (date.getTime() < duration.msStart) date.setMonth(date.getMonth() + 1);
    while (date.getTime() < duration.msEnd) {
      const ms = date.getTime();
      ticks.push({
        left: ((ms - duration.msStart) / duration.msDuration) * 100,
        ms
      });
      date.setMonth(date.getMonth() + 1);
    }
  } else if (unit === "year") {
    const date = new Date(duration.msStart);
    date.setFullYear(date.getFullYear() + 1);
    date.setMonth(0);
    date.setDate(1);
    const timezoneHours = parseTimezoneOffsetToMs(timezone) / (60 * 60 * 1000);
    date.setHours(timezoneHours);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // Need to check the start since we consider timezone in hours
    if (date.getTime() < duration.msStart)
      date.setFullYear(date.getFullYear() + 1);
    while (date.getTime() < duration.msEnd) {
      const ms = date.getTime();
      ticks.push({
        left: ((ms - duration.msStart) / duration.msDuration) * 100,
        ms
      });
      date.setFullYear(date.getFullYear() + 1);
    }
  } else {
    const start = msStep - (duration.msStart % msStep);
    for (let t = duration.msStart + start; t <= duration.msEnd; t += msStep) {
      ticks.push({
        left: ((t - duration.msStart) / duration.msDuration) * 100,
        ms: t
      });
    }
  }
  return ticks;
};

/**
 * Parse timezone offset string (e.g., "+09:00", "-05:00") to milliseconds
 */
const parseTimezoneOffsetToMs = (offset: string): number => {
  const match = offset.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const [, sign, hours, minutes] = match;
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
  const totalMs = totalMinutes * 60 * 1000;
  return sign === "+" ? totalMs : -totalMs;
};

// Need to change date with timezone to calculate correct day-breaking etc.
export const getOffsetedDateWithTimezone = (time: number, timezone: string) => {
  const timezoneOffset = parseTimezoneOffsetToMs(timezone);
  return new Date(time + timezoneOffset);
};

export const getRevertOffsetedDateWithTimezone = (
  time: number,
  timezone: string
) => {
  const timezoneOffset = parseTimezoneOffsetToMs(timezone);
  return new Date(time - timezoneOffset);
};

// Need to remove effect of local timezone to display correct date.
export const formatDate = (
  time: number,
  timezone: string,
  displayYear = false
) => {
  const dateWithoutLocalTimezone = getRevertOffsetedDateWithTimezone(
    time,
    timezone
  );

  const adjusted = formatTimeInTimezone(
    dateWithoutLocalTimezone.getTime(),
    timezone,
    {
      includeSeconds: true,
      includeMilliseconds: false,
      customFormat: displayYear ? "HH:mm:ss MM/DD/YYYY" : "HH:mm:ss MM/DD",
      showTimezone: true
    }
  );

  return adjusted.split(" ").reverse();
};
