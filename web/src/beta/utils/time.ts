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
      if (lang === "ja") {
        return `${interval}${unitLabel}前`;
      } else {
        return `${interval} ${unitLabel} ago`;
      }
    }
  }

  return lang === "ja" ? "たった今" : "just now";
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

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export const isValidDateTimeFormat = (time: string): boolean => {
  const pattern =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|([+-]\d{2}:\d{2}))?$/;
  const match = time.match(pattern);

  if (!match) {
    return false;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = match[6] ? parseInt(match[6], 10) : 0;

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  if (day < 1 || day > daysInMonth[month - 1]) {
    return false;
  }

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return false;
  }

  if (match[9]) {
    const tzOffset = match[9];
    const tzPattern = /^([+-])(\d{2}):(\d{2})$/;
    const tzMatch = tzOffset.match(tzPattern);

    if (!tzMatch) {
      return false;
    }

    const tzHour = parseInt(tzMatch[2], 10);
    const tzMinute = parseInt(tzMatch[3], 10);

    if (tzHour > 14 || tzMinute > 59) {
      return false;
    }
  }

  return true;
};

export type ParsedDateTime = {
  parsedDate: string;
  timeWithOffset: string;
  parsedTime: string;
  timezoneOffset: string;
};

export const parseDateTime = (value: string): ParsedDateTime | null => {
  const match = value.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)(Z|([+-]\d{2}:\d{2}))?$/
  );

  if (!match) {
    return null;
  }

  const parsedDate = match[1];
  const timeWithOffset = match[2] + (match[3] || "");
  const parsedTime = match[2];
  const timezoneOffset =
    match[3] === "Z" ? "00:00" : match[3]?.replace("+", "") || "00:00";

  return {
    parsedDate,
    timeWithOffset,
    parsedTime,
    timezoneOffset
  };
};
