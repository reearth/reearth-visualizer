import { describe, test, expect, it } from "vitest";

import { formatRelativeTime, parseDateTime } from "./time";

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
