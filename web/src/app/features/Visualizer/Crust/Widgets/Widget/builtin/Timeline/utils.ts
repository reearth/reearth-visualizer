export const isTimelineValid = (timeline: {
  startTime?: string;
  endTime?: string;
  currentTime?: string;
}) => {
  if (!timeline.startTime || !timeline.endTime || !timeline.currentTime) {
    return false;
  }

  const startTime = new Date(timeline.startTime).getTime();
  const endTime = new Date(timeline.endTime).getTime();
  const currentTime = new Date(timeline.currentTime).getTime();

  if (isNaN(startTime) || isNaN(endTime) || isNaN(currentTime)) {
    return false;
  }

  if (startTime > endTime || currentTime < startTime || currentTime > endTime) {
    return false;
  }

  return true;
};

export type TimeFormatOptions = {
  /** Include seconds in the time display */
  includeSeconds?: boolean;
  /** Include milliseconds in the time display */
  includeMilliseconds?: boolean;
  /** Date format style */
  dateStyle?: "short" | "medium" | "long" | "full";
  /** Time format style */
  timeStyle?: "short" | "medium" | "long" | "full";
  /** Custom format pattern (overrides dateStyle/timeStyle) */
  customFormat?: string;
  /** Hour format (12 or 24 hour) */
  hour12?: boolean;
  /** Show timezone abbreviation */
  showTimezone?: boolean;
};

/**
 * Parse timezone offset string (e.g., "+09:00", "-05:00") to minutes
 */
export const parseTimezoneOffset = (offset: string): number => {
  const match = offset.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const [, sign, hours, minutes] = match;
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
  return sign === "+" ? totalMinutes : -totalMinutes;
};

/**
 * Format a timestamp to a readable string with timezone support
 * @param timestamp - Unix timestamp in milliseconds
 * @param timezoneOffset - Timezone offset string (e.g., "+09:00", "-05:00") or timezone name
 * @param options - Formatting options
 * @returns Formatted time string
 */
export const formatTimeInTimezone = (
  timestamp: number,
  timezoneOffset = "+00:00",
  options: TimeFormatOptions = {}
): string => {
  const {
    includeSeconds = true,
    includeMilliseconds = false,
    dateStyle = "short",
    timeStyle = "medium",
    customFormat,
    hour12 = false,
    showTimezone = true
  } = options;

  // Validate timestamp
  if (isNaN(timestamp) || timestamp < 0) {
    return "Invalid Date";
  }

  // Handle timezone offset format (+/-HH:MM)
  if (timezoneOffset.match(/^[+-]\d{2}:\d{2}$/)) {
    return formatTimeWithOffset(timestamp, timezoneOffset, options);
  }

  // Handle named timezone (fallback to original implementation)
  const date = new Date(timestamp);
  let targetTimezone = timezoneOffset;

  // Validate timezone
  try {
    // Test if timezone is valid by creating a formatter
    new Intl.DateTimeFormat("en", { timeZone: targetTimezone });
  } catch (_error) {
    console.warn(`Invalid timezone: ${targetTimezone}, falling back to UTC`);
    targetTimezone = "UTC";
  }

  // Custom format pattern (if provided)
  if (customFormat) {
    return formatWithCustomPattern(date, targetTimezone, customFormat);
  }

  // Build formatter options
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: targetTimezone,
    hour12
  };

  // Set date and time styles
  if (dateStyle) formatOptions.dateStyle = dateStyle;
  if (timeStyle) formatOptions.timeStyle = timeStyle;

  // Override time components if needed
  if (includeSeconds || includeMilliseconds || timeStyle === "short") {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";

    if (includeSeconds || timeStyle !== "short") {
      formatOptions.second = "2-digit";
    }
  }

  // Add timezone display
  if (showTimezone) {
    formatOptions.timeZoneName = "short";
  }

  try {
    let formatted = new Intl.DateTimeFormat("en", formatOptions).format(date);

    // Add milliseconds if requested (not supported by Intl.DateTimeFormat)
    if (includeMilliseconds) {
      const ms = date.getMilliseconds().toString().padStart(3, "0");
      formatted = formatted.replace(/(\d{2}:\d{2}:\d{2})/, `$1.${ms}`);
    }

    return formatted;
  } catch (error) {
    console.error("Error formatting date:", error);
    return date.toISOString();
  }
};

/**
 * Format timestamp with timezone offset
 */
export const formatTimeWithOffset = (
  timestamp: number,
  offset: string,
  options: TimeFormatOptions
): string => {
  const {
    includeSeconds = true,
    includeMilliseconds = false,
    customFormat,
    hour12 = false,
    showTimezone = true
  } = options;

  const offsetMinutes = parseTimezoneOffset(offset);
  const adjustedTime = timestamp + offsetMinutes * 60 * 1000;
  const date = new Date(adjustedTime);

  // Custom format pattern
  if (customFormat) {
    return formatOffsetWithCustomPattern(date, offset, customFormat);
  }

  // Default formatting
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, "0");

  // Handle 12/24 hour format
  let ampm = "";
  if (hour12) {
    ampm = hours >= 12 ? " PM" : " AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }
  const hourStr = String(hours).padStart(2, "0");

  // Build time string
  let timeStr = `${hourStr}:${minutes}`;
  if (includeSeconds) {
    timeStr += `:${seconds}`;
  }
  if (includeMilliseconds) {
    timeStr += `.${milliseconds}`;
  }
  timeStr += ampm;

  // Build date string
  const dateStr = `${month}/${day}/${year}`;

  // Add timezone if requested
  const timezoneStr = showTimezone ? ` GMT${offset}` : "";

  return `${timeStr} ${dateStr}${timezoneStr}`;
};

/**
 * Format with custom pattern for timezone offsets
 * Supports: YYYY, MM, DD, HH, mm, ss, SSS, Z
 */
const formatOffsetWithCustomPattern = (
  date: Date,
  offset: string,
  pattern: string
): string => {
  const year = date.getUTCFullYear().toString();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");

  return pattern
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hour)
    .replace(/mm/g, minute)
    .replace(/ss/g, second)
    .replace(/SSS/g, ms)
    .replace(/Z/g, offset);
};

/**
 * Format with custom pattern (basic implementation)
 * Supports: YYYY, MM, DD, HH, mm, ss, SSS, Z
 */
const formatWithCustomPattern = (
  date: Date,
  timezone: string,
  pattern: string
): string => {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const partsMap: Record<string, string> = {};

  parts.forEach((part) => {
    partsMap[part.type] = part.value;
  });

  return pattern
    .replace(/YYYY/g, partsMap.year)
    .replace(/MM/g, partsMap.month)
    .replace(/DD/g, partsMap.day)
    .replace(/HH/g, partsMap.hour)
    .replace(/mm/g, partsMap.minute)
    .replace(/ss/g, partsMap.second)
    .replace(/SSS/g, date.getMilliseconds().toString().padStart(3, "0"));
};

/**
 * Get timezone offset string (e.g., "+09:00", "-05:00")
 */
export const getTimezoneOffset = (
  timestamp: number,
  timezone: string
): string => {
  try {
    const date = new Date(timestamp);
    const utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const targetTime = new Date(
      utc.toLocaleString("en-US", { timeZone: timezone })
    );
    const offset = (targetTime.getTime() - utc.getTime()) / 60000;

    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? "+" : "-";

    return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch (_error) {
    return "+00:00";
  }
};

/**
 * Get user's local timezone offset
 */
export const getUserTimezoneOffset = (): string => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? "+" : "-"; // Note: getTimezoneOffset() returns negative for positive offsets

  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Get a short, readable timezone display format for timeline
 * @param timestamp - Unix timestamp in milliseconds
 * @param timezoneOffset - Timezone offset string or undefined to use local timezone
 */
export const formatTimelineTime = (
  timestamp: number,
  timezoneOffset?: string
): string => {
  const effectiveOffset = timezoneOffset ?? getUserTimezoneOffset();

  return formatTimeInTimezone(timestamp, effectiveOffset, {
    includeSeconds: true,
    includeMilliseconds: false,
    customFormat: "HH:mm:ss MM/DD/YYYY Z",
    showTimezone: true
  });
};

/**
 * Create timezone offset constants from the provided list
 */
export const TIMEZONE_OFFSETS = [
  "-12:00",
  "-11:00",
  "-10:00",
  "-09:30",
  "-09:00",
  "-08:00",
  "-07:00",
  "-06:00",
  "-05:00",
  "-04:30",
  "-04:00",
  "-03:30",
  "-03:00",
  "-02:00",
  "-01:00",
  "+00:00",
  "+01:00",
  "+02:00",
  "+03:00",
  "+03:30",
  "+04:00",
  "+04:30",
  "+05:00",
  "+05:30",
  "+05:45",
  "+06:00",
  "+06:30",
  "+07:00",
  "+08:00",
  "+08:45",
  "+09:00",
  "+09:30",
  "+10:00",
  "+10:30",
  "+11:00",
  "+12:00",
  "+12:45",
  "+13:00",
  "+14:00"
] as const;

/**
 * Validate if a timezone offset is in the supported list
 */
export const isValidTimezoneOffset = (offset: string): boolean => {
  return (TIMEZONE_OFFSETS as readonly string[]).includes(offset);
};
