import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { isEmptyString, generateRandomString } from "./string";

describe("isEmptyString", () => {
  it("should return true for null input", () => {
    // @ts-expect-error - intentionally testing null case
    expect(isEmptyString(null)).toBe(true);
  });

  it("should return true for empty string", () => {
    expect(isEmptyString("")).toBe(true);
  });

  it("should return true for string with only spaces", () => {
    expect(isEmptyString("   ")).toBe(true);
  });

  it("should return false for string with non-space characters", () => {
    expect(isEmptyString("hello")).toBe(false);
    expect(isEmptyString(" hello ")).toBe(false);
    expect(isEmptyString("  hi  ")).toBe(false);
  });

  it("should return false for string with non-ASCII characters", () => {
    expect(isEmptyString("こんにちは")).toBe(false);
    expect(isEmptyString("你好")).toBe(false);
    expect(isEmptyString("Привет")).toBe(false);
  });
});

describe("generateRandomString", () => {
  beforeEach(() => {
    const mockGetRandomValues = vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = i % 26;
      }
      return arr;
    });

    vi.stubGlobal("crypto", {
      getRandomValues: mockGetRandomValues
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate a string of the specified length", () => {
    const length = 8;
    const result = generateRandomString(length);
    expect(result.length).toBe(length);
  });

  it("should generate lowercase letters only", () => {
    const result = generateRandomString(10);
    expect(result).toMatch(/^[a-z]+$/);
  });

  it("should generate the expected string with mocked random values", () => {
    expect(generateRandomString(5)).toBe("abcde");
    expect(generateRandomString(10)).toBe("abcdefghij");
  });

  it("should handle zero length input", () => {
    expect(generateRandomString(0)).toBe("");
  });
});
