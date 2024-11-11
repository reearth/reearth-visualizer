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

export const formatRelativeTime = (date: Date, lang = "en"): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const units: Record<
    string,
    { value: number; label: string; jaLabel: string }
  > = {
    year: { value: 31536000, label: "year", jaLabel: "年" },
    month: { value: 2592000, label: "month", jaLabel: "ヶ月" },
    day: { value: 86400, label: "day", jaLabel: "日" },
    hour: { value: 3600, label: "hour", jaLabel: "時間" },
    minute: { value: 60, label: "minute", jaLabel: "分" },
    second: { value: 1, label: "second", jaLabel: "秒" }
  };

  for (const unitKey in units) {
    const { value, label, jaLabel } = units[unitKey];
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      const unitLabel =
        lang === "ja"
          ? jaLabel
          : label + (interval > 1 && lang !== "ja" ? "s" : "");
      return `${interval} ${unitLabel}${lang === "ja" ? " 前" : " ago"}`;
    }
  }

  return "just now";
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
