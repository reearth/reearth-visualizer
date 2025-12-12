import { TickUnit } from "./types";

export const TICK_GROUPS: { unit: TickUnit; ms: number }[] = [
  { unit: "second", ms: 1000 },
  { unit: "min", ms: 60000 },
  { unit: "tenmin", ms: 600000 },
  { unit: "halfhour", ms: 1800000 },
  { unit: "hour", ms: 3600000 },
  { unit: "day", ms: 86400000 },
  { unit: "month", ms: 2419200000 }, // 28 days, should not use this ms in tick calc since month is not fixed
  { unit: "year", ms: 31536000000 } // 365 days, should not use this ms in tick calc since year is not fixed
];

export const MIN_TICK_WIDTH = 5;
export const END_PADDING = 30;
export const LABEL_WIDTH = 60;
