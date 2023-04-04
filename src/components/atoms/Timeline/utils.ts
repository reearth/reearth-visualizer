import {
  BORDER_WIDTH,
  EPOCH_SEC,
  MINUTES_SEC,
  NORMAL_SCALE_WIDTH,
  PADDING_HORIZONTAL,
  SCALE_LABEL_WIDTH,
  STRONG_SCALE_WIDTH,
} from "./constants";

const MONTH_LABEL_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatDateForTimeline = (time: number, options: { detail?: boolean } = {}) => {
  const d = new Date(time);
  const year = d.getFullYear();
  const month = MONTH_LABEL_LIST[d.getMonth()];
  const date = `${d.getDate()}`.padStart(2, "0");
  const hour = `${d.getHours()}`.padStart(2, "0");
  if (!options.detail) {
    return `${month} ${date} ${year} ${hour}:00:00.00`;
  }
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const seconds = `${d.getSeconds()}`.padStart(2, "0");
  return `${month} ${date} ${year} ${hour}:${minutes}:${seconds}.00`;
};

const roundScaleInterval = (interval: number) => {
  if (interval < 5) {
    return 1;
  }
  if (5 <= interval && interval < 30) {
    return 5 * Math.round(interval / 5);
  }
  if (30 <= interval && interval < 60) {
    return 30 * Math.trunc(interval / 30);
  }
  return 60 * Math.round(interval / 60);
};

const DEFAULT_STRONG_SCALE_MINUTES = 10;
const ADDITIONAL_STRONG_SCALE_MINUTES = 5;
export const calcScaleInterval = (
  rangeDiff: number,
  zoom: number,
  styles: { width: number; gap: number },
) => {
  const timelineWidth = styles.width - (PADDING_HORIZONTAL + BORDER_WIDTH) * 2;
  const scaleWidth = styles.gap + NORMAL_SCALE_WIDTH;
  // Get number of scale that fits to current timeline width.
  const numberOfScales = Math.round(timelineWidth / scaleWidth) - 1;
  // Scale interval to round time like 30 mins, 1 hour
  const scaleInterval =
    roundScaleInterval(rangeDiff / (MINUTES_SEC * EPOCH_SEC) / numberOfScales) * MINUTES_SEC;
  const zoomedScaleInterval = Math.max(scaleInterval / zoom, MINUTES_SEC);

  // convert epoch diff to minutes.
  const scaleCount = rangeDiff / EPOCH_SEC / zoomedScaleInterval;

  // Adjust scale space gap.
  const strongScaleCount = scaleCount / DEFAULT_STRONG_SCALE_MINUTES - 1;
  const initialDisplayedWidth =
    (scaleCount - strongScaleCount) * scaleWidth +
    strongScaleCount * (styles.gap + STRONG_SCALE_WIDTH);
  const initialRemainingGap = (timelineWidth - initialDisplayedWidth) / scaleCount;

  // To fit scale in initial width, adjusted gap is added only when zoom level is 1.
  const nextGap = zoom === 1 ? styles.gap + initialRemainingGap : styles.gap;

  // Adjust strong scale position
  const diffLabelWidth = Math.max(SCALE_LABEL_WIDTH - nextGap * DEFAULT_STRONG_SCALE_MINUTES, 0);
  const strongScaleMinutes =
    DEFAULT_STRONG_SCALE_MINUTES +
    Math.floor(diffLabelWidth / DEFAULT_STRONG_SCALE_MINUTES) * ADDITIONAL_STRONG_SCALE_MINUTES;

  return {
    scaleCount: Math.trunc(scaleCount),
    scaleInterval: Math.trunc(zoomedScaleInterval),
    strongScaleMinutes,
    gap: nextGap,
  };
};
