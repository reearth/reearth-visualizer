export const convertTime = (
  time: string | Date | undefined
): Date | undefined => {
  if (!time) return;
  if (time instanceof Date) {
    return !isNaN(time.getTime()) ? time : undefined;
  }
  try {
    const dateTime = new Date(time);
    return !isNaN(dateTime.getTime()) ? dateTime : undefined;
  } catch {
    return undefined;
  }
};

export const truncMinutes = (d: Date) => {
  d.setMinutes(0);
  d.setSeconds(0, 0);
  return d;
};

export const formatRelativeTime = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = 0;

  const pluralize = (value: number, unit: string): string => {
    return value === 1 ? `${value} ${unit}` : `${value} ${unit}s`;
  };

  switch (true) {
    case (interval = seconds / 31536000) > 1:
      return pluralize(Math.floor(interval), "year") + " ago";
    case (interval = seconds / 2592000) > 1:
      return pluralize(Math.floor(interval), "month") + " ago";
    case (interval = seconds / 86400) > 1:
      return pluralize(Math.floor(interval), "day") + " ago";
    case (interval = seconds / 3600) > 1:
      return pluralize(Math.floor(interval), "hour") + " ago";
    case (interval = seconds / 60) > 1:
      return pluralize(Math.floor(interval), "minute") + " ago";
    default:
      return pluralize(Math.floor(seconds), "second") + " ago";
  }
};

// Time zones around the world generally fall within offsets from UTC ranging from -12:00 to +14:00
export const TIMEZONE_OFFSETS = [
  "-12:00",
  "-11:00",
  "-10:00",
  "-09:00",
  "-08:00",
  "-07:00",
  "-06:00",
  "-05:00",
  "-04:00",
  "-03:00",
  "-02:00",
  "-01:00",
  "+00:00",
  "+01:00",
  "+02:00",
  "+03:00",
  "+04:00",
  "+05:00",
  "+06:00",
  "+07:00",
  "+08:00",
  "+09:00",
  "+10:00",
  "+11:00",
  "+12:00",
  "+13:00",
  "+14:00"
] as const;

export type TimeZoneOffset = (typeof TIMEZONE_OFFSETS)[number];

export const getLocalTimezoneOffset = (): TimeZoneOffset => {
  const date = new Date();
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(
    2,
    "0"
  );
  return `${sign}${hours}:00` as TimeZoneOffset;
};

export const isValidTimezone = (timezone: string): boolean => {
  return TIMEZONE_OFFSETS.includes(timezone as TimeZoneOffset);
};

export const getTimeZone = (time: string): TimeZoneOffset | undefined => {
  const zone = time.match(/([-+]\d{1,2}:\d{2})$/)?.[1];
  return !zone
    ? undefined
    : isValidTimezone(zone)
      ? (zone as TimeZoneOffset)
      : undefined;
};

export const isValidDateTimeFormat = (time: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([-+]\d{2}:\d{2})$/.test(time);
};
