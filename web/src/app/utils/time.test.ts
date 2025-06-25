import { describe, test, expect, it } from "vitest";

import {
  formatRelativeTime,
  parseDateTime,
  truncMinutes,
  isValidTimezone,
  getTimeZone,
  isValidDateTimeFormat,
  TIMEZONE_OFFSETS
} from "./time";

describe("truncMinutes", () => {
  it("truncates minutes, seconds, and milliseconds to zero", () => {
    const date = new Date(2023, 5, 15, 10, 30, 45, 500);
    const result = truncMinutes(date);

    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("preserves the hour, day, month, and year", () => {
    const date = new Date(2023, 5, 15, 10, 30, 45, 500);
    const result = truncMinutes(date);

    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(10);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date();

  test('returns "just now" for current time in English', () => {
    expect(formatRelativeTime(now, "en")).toBe("just now");
  });

  test('returns "たっだ今" for current time in Japanese', () => {
    expect(formatRelativeTime(now, "ja")).toBe("たった今");
  });

  test("returns 10 seconds ago in English", () => {
    const date = new Date(now.getTime() - 10 * 1000); // 10 seconds ago
    expect(formatRelativeTime(date, "en")).toBe("10 seconds ago");
  });

  test("returns 10 seconds ago in Japanese", () => {
    const date = new Date(now.getTime() - 10 * 1000); // 10 seconds ago
    expect(formatRelativeTime(date, "ja")).toBe("10秒前");
  });

  test("returns 5 minutes ago in English", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatRelativeTime(date, "en")).toBe("5 minutes ago");
  });

  test("returns 5 minutes ago in Japanese", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatRelativeTime(date, "ja")).toBe("5分前");
  });

  test("returns 3 hours ago in English", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatRelativeTime(date, "en")).toBe("3 hours ago");
  });

  test("returns 3 hours ago in Japanese", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatRelativeTime(date, "ja")).toBe("3時間前");
  });

  test("returns 2 days ago in English", () => {
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(formatRelativeTime(date, "en")).toBe("2 days ago");
  });

  test("returns 2 days ago in Japanese", () => {
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(formatRelativeTime(date, "ja")).toBe("2日前");
  });

  test("returns 3 months ago in English", () => {
    const date = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
    expect(formatRelativeTime(date, "en")).toBe("3 months ago");
  });

  test("returns 3 months ago in Japanese", () => {
    const date = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
    expect(formatRelativeTime(date, "ja")).toBe("3ヶ月前");
  });

  test("returns 2 years ago in English", () => {
    const date = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    expect(formatRelativeTime(date, "en")).toBe("2 years ago");
  });

  test("returns 2 years ago in Japanese", () => {
    const date = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    expect(formatRelativeTime(date, "ja")).toBe("2年前");
  });
}); // Replace with actual path

describe("isValidTimezone", () => {
  it("should return true for valid timezone offsets", () => {
    expect(isValidTimezone("+00:00")).toBe(true);
    expect(isValidTimezone("-08:00")).toBe(true);
    expect(isValidTimezone("+14:00")).toBe(true);
    expect(isValidTimezone("-12:00")).toBe(true);
  });

  it("should return false for invalid timezone offsets", () => {
    expect(isValidTimezone("+15:00")).toBe(false);
    expect(isValidTimezone("-13:00")).toBe(false);
    expect(isValidTimezone("UTC")).toBe(false);
    expect(isValidTimezone("GMT+2")).toBe(false);
    expect(isValidTimezone("America/New_York")).toBe(false);
    expect(isValidTimezone("+08:30")).toBe(false);
    expect(isValidTimezone("08:00")).toBe(false);
  });
});

describe("getTimeZone", () => {
  it("should extract valid timezone from datetime string", () => {
    expect(getTimeZone("2023-06-15T14:30:45+08:00")).toBe("+08:00");
    expect(getTimeZone("2023-06-15T14:30:45-05:00")).toBe("-05:00");
    expect(getTimeZone("2023-06-15 14:30:45+00:00")).toBe("+00:00");
  });

  it("should return undefined for invalid timezone formats", () => {
    expect(getTimeZone("2023-06-15T14:30:45+15:00")).toBeUndefined();
    expect(getTimeZone("2023-06-15T14:30:45-13:00")).toBeUndefined();
    expect(getTimeZone("2023-06-15T14:30:45+8:00")).toBeUndefined();
    expect(getTimeZone("2023-06-15T14:30:45GMT")).toBeUndefined();
  });

  it("should return undefined when no timezone is present", () => {
    expect(getTimeZone("2023-06-15T14:30:45")).toBeUndefined();
    expect(getTimeZone("2023-06-15")).toBeUndefined();
    expect(getTimeZone("")).toBeUndefined();
  });
});

describe("isValidDateTimeFormat", () => {
  it("should return true for valid ISO 8601 datetime formats", () => {
    expect(isValidDateTimeFormat("2023-06-15T14:30:45Z")).toBe(true);
    expect(isValidDateTimeFormat("2023-06-15T14:30:45+08:00")).toBe(true);
    expect(isValidDateTimeFormat("2023-06-15T14:30:45-05:00")).toBe(true);
    expect(isValidDateTimeFormat("2023-06-15T14:30Z")).toBe(true);
    expect(isValidDateTimeFormat("2023-06-15T14:30:45.123Z")).toBe(true);
    expect(isValidDateTimeFormat("2023-06-15T14:30:45.123+08:00")).toBe(true);
  });

  it("should return false for invalid datetime formats", () => {
    expect(isValidDateTimeFormat("2023/06/15T14:30:45Z")).toBe(false);
    expect(isValidDateTimeFormat("2023-06-15 14:30:45Z")).toBe(false);
    expect(isValidDateTimeFormat("2023-06-15")).toBe(false);
    expect(isValidDateTimeFormat("14:30:45")).toBe(false);
    expect(isValidDateTimeFormat("2023-06-15T14:30:45GMT")).toBe(false);
    expect(isValidDateTimeFormat("2023-06-15T14:30:45+0800")).toBe(false);
    expect(isValidDateTimeFormat("2023-13-15T14:30:45Z")).toBe(false);
  });
});

describe("TIMEZONE_OFFSETS", () => {
  it("should validate all predefined timezone offsets", () => {
    TIMEZONE_OFFSETS.forEach((offset) => {
      expect(isValidTimezone(offset)).toBe(true);
    });
  });
});

describe("parseDateTime", () => {
  it.each([
    [
      "2024-01-01T12:00Z",
      {
        parsedDate: "2024-01-01",
        timeWithOffset: "12:00Z",
        parsedTime: "12:00",
        timezoneOffset: "00:00"
      }
    ],
    [
      "2024-01-01T12:00:00Z",
      {
        parsedDate: "2024-01-01",
        timeWithOffset: "12:00:00Z",
        parsedTime: "12:00:00",
        timezoneOffset: "00:00"
      }
    ],
    [
      "2024-01-01T12:00:00.123Z",
      {
        parsedDate: "2024-01-01",
        timeWithOffset: "12:00:00.123Z",
        parsedTime: "12:00:00.123",
        timezoneOffset: "00:00"
      }
    ],
    [
      "2024-01-01T12:00+09:00",
      {
        parsedDate: "2024-01-01",
        timeWithOffset: "12:00+09:00",
        parsedTime: "12:00",
        timezoneOffset: "09:00"
      }
    ],
    [
      "2024-01-01T12:00:00+09:00",
      {
        parsedDate: "2024-01-01",
        timeWithOffset: "12:00:00+09:00",
        parsedTime: "12:00:00",
        timezoneOffset: "09:00"
      }
    ],
    [
      "2024-01-01T12:00:00.123+09:00",
      {
        parsedDate: "2024-01-01",
        timeWithOffset: "12:00:00.123+09:00",
        parsedTime: "12:00:00.123",
        timezoneOffset: "09:00"
      }
    ]
  ])("should correctly parse %s", (input, expected) => {
    const result = parseDateTime(input);
    expect(result).toEqual(expected);
  });

  it.each([
    "invalid",
    "2024-01-01",
    "2024-01-01T12",
    "2024-01-01T12:00+9:00",
    ""
  ])("should return null for invalid datetime format %s", (input) => {
    const result = parseDateTime(input);
    expect(result).toBeNull();
  });
});
