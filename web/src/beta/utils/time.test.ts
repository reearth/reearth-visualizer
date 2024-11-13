import { describe, test, expect } from "vitest";

import { formatRelativeTime } from "./time";

describe("formatRelativeTime", () => {
  const now = new Date();

  test('returns "just now" for current time in English', () => {
    expect(formatRelativeTime(now, "en")).toBe("just now");
  });

  test('returns "たっだ今" for current time in Japanese', () => {
    expect(formatRelativeTime(now, "ja")).toBe("たっだ今");
  });

  test("returns 10 seconds ago in English", () => {
    const date = new Date(now.getTime() - 10 * 1000); // 10 seconds ago
    expect(formatRelativeTime(date, "en")).toBe("10 seconds ago");
  });

  test("returns 10 seconds ago in Japanese", () => {
    const date = new Date(now.getTime() - 10 * 1000); // 10 seconds ago
    expect(formatRelativeTime(date, "ja")).toBe("10 秒 前");
  });

  test("returns 5 minutes ago in English", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatRelativeTime(date, "en")).toBe("5 minutes ago");
  });

  test("returns 5 minutes ago in Japanese", () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatRelativeTime(date, "ja")).toBe("5 分 前");
  });

  test("returns 3 hours ago in English", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatRelativeTime(date, "en")).toBe("3 hours ago");
  });

  test("returns 3 hours ago in Japanese", () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatRelativeTime(date, "ja")).toBe("3 時間 前");
  });

  test("returns 2 days ago in English", () => {
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(formatRelativeTime(date, "en")).toBe("2 days ago");
  });

  test("returns 2 days ago in Japanese", () => {
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(formatRelativeTime(date, "ja")).toBe("2 日 前");
  });

  test("returns 3 months ago in English", () => {
    const date = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
    expect(formatRelativeTime(date, "en")).toBe("3 months ago");
  });

  test("returns 3 months ago in Japanese", () => {
    const date = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago
    expect(formatRelativeTime(date, "ja")).toBe("3 ヶ月 前");
  });

  test("returns 2 years ago in English", () => {
    const date = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    expect(formatRelativeTime(date, "en")).toBe("2 years ago");
  });

  test("returns 2 years ago in Japanese", () => {
    const date = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    expect(formatRelativeTime(date, "ja")).toBe("2 年 前");
  });
});
