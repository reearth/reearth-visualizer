export type TickUnit =
  | "second"
  | "min"
  | "tenmin"
  | "halfhour"
  | "hour"
  | "day"
  | "month"
  | "year";

export type Duration = {
  msStart: number;
  msEnd: number;
  msDuration: number;
};
