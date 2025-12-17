import { TimelineCommitter } from "@reearth/core";

export const TIMELINE_CHANNEL_LABEL_WIDTH = 182;
export const TIMELINE_MIN_WIDTH = 700;
export const TIMELINE_CHANNEL_DISPLAY_MAX = 3;
export const TIMELINE_DEFAULT_TIMEZONE_OFFSET = "+09:00";

export const TIMELINE_COMMITER = {
  source: "builtin-timeline-widget",
  id: "builtin-timeline-widget"
} as unknown as TimelineCommitter;

export const TIMELINE_PLAY_SPEED_OPTIONS = [
  { timeString: "1sec/sec", seconds: "1" },
  { timeString: "0.5min/sec", seconds: "30" },
  { timeString: "1min/sec", seconds: "60" },
  { timeString: "0.1hr/sec", seconds: "360" },
  { timeString: "0.5hr/sec", seconds: "1800" },
  { timeString: "1hr/sec", seconds: "3600" }
];
