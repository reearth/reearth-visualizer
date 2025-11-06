import { describe, it, expect } from "vitest";

import { isValidUrl } from "./url";

describe("isValidUrl", () => {
  it("should return true for valid HTTP URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("http://www.example.com")).toBe(true);
    expect(isValidUrl("http://example.com:8080")).toBe(true);
    expect(isValidUrl("http://example.com/path")).toBe(true);
    expect(isValidUrl("http://example.com/path?query=value")).toBe(true);
    expect(isValidUrl("http://example.com/path#fragment")).toBe(true);
  });

  it("should return true for valid HTTPS URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://www.example.com")).toBe(true);
    expect(isValidUrl("https://example.com:443")).toBe(true);
    expect(isValidUrl("https://example.com/path")).toBe(true);
    expect(isValidUrl("https://example.com/path?query=value")).toBe(true);
    expect(isValidUrl("https://example.com/path#fragment")).toBe(true);
  });

  it("should return true for URLs with complex paths and parameters", () => {
    expect(isValidUrl("https://api.example.com/v1/users/123?include=profile&format=json")).toBe(true);
    expect(isValidUrl("https://example.com/path/to/resource.html#section-1")).toBe(true);
    expect(isValidUrl("https://subdomain.example.com:3000/api/endpoint")).toBe(true);
  });

  it("should return true for URLs with special characters", () => {
    expect(isValidUrl("https://example.com/path?query=hello%20world")).toBe(true);
    expect(isValidUrl("https://example.com/path with spaces")).toBe(true);
    expect(isValidUrl("https://example.com/中文路径")).toBe(true);
  });

  it("should return true for localhost URLs", () => {
    expect(isValidUrl("http://localhost")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
    expect(isValidUrl("https://localhost:8080/api")).toBe(true);
  });

  it("should return true for IP address URLs", () => {
    expect(isValidUrl("http://192.168.1.1")).toBe(true);
    expect(isValidUrl("https://127.0.0.1:8080")).toBe(true);
    expect(isValidUrl("http://10.0.0.1/path")).toBe(true);
  });

  it("should return true for other valid protocols", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(true);
    expect(isValidUrl("mailto:user@example.com")).toBe(true);
    expect(isValidUrl("tel:+1234567890")).toBe(true);
    expect(isValidUrl("file:///path/to/file.txt")).toBe(true);
  });

  it("should return false for invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl("http://")).toBe(false);
    expect(isValidUrl("https://")).toBe(false);
    expect(isValidUrl("://example.com")).toBe(false);
  });

  it("should return false for malformed URLs", () => {
    expect(isValidUrl("http/example.com")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
    expect(isValidUrl("www.example.com")).toBe(false);
  });

  it("should return true for URLs that are technically valid but may seem malformed", () => {
    // Note: URL constructor treats "http:example.com" as valid (scheme:path format)
    expect(isValidUrl("http:example.com")).toBe(true);
    // URL constructor handles double dots in domain names
    expect(isValidUrl("https://example..com")).toBe(true);
  });

  it("should return false for URLs with invalid characters", () => {
    expect(isValidUrl("http://exam ple.com")).toBe(false);
    expect(isValidUrl("https://exam<>ple.com")).toBe(false);
    expect(isValidUrl("http://[invalid]")).toBe(false);
  });

  it("should handle edge cases", () => {
    expect(isValidUrl(null)).toBe(false);
    expect(isValidUrl(undefined)).toBe(false);
    // @ts-expect-error - intentionally testing number case
    expect(isValidUrl(123)).toBe(false);
    // @ts-expect-error - intentionally testing object case
    expect(isValidUrl({})).toBe(false);
  });

  it("should return false for URLs that are just whitespace", () => {
    expect(isValidUrl(" ")).toBe(false);
    expect(isValidUrl("   ")).toBe(false);
    expect(isValidUrl("\t")).toBe(false);
    expect(isValidUrl("\n")).toBe(false);
  });

  it("should handle very long URLs", () => {
    const longPath = "a".repeat(2000);
    const longUrl = `https://example.com/${longPath}`;
    expect(isValidUrl(longUrl)).toBe(true);
  });

  it("should handle URLs with authentication", () => {
    expect(isValidUrl("https://user:password@example.com")).toBe(true);
    expect(isValidUrl("ftp://user@files.example.com")).toBe(true);
  });

  it("should handle URLs with non-standard ports", () => {
    expect(isValidUrl("https://example.com:9999")).toBe(true);
    expect(isValidUrl("http://example.com:80")).toBe(true);
    expect(isValidUrl("https://example.com:443")).toBe(true);
  });

  it("should handle data URLs", () => {
    expect(isValidUrl("data:text/plain;base64,SGVsbG8gV29ybGQ=")).toBe(true);
    expect(isValidUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")).toBe(true);
  });

  it("should handle blob URLs", () => {
    expect(isValidUrl("blob:https://example.com/550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("should handle JavaScript URLs", () => {
    expect(isValidUrl("javascript:void(0)")).toBe(true);
    expect(isValidUrl("javascript:alert('hello')")).toBe(true);
  });

  it("should handle about URLs", () => {
    expect(isValidUrl("about:blank")).toBe(true);
    expect(isValidUrl("about:config")).toBe(true);
  });

  it("should handle URLs with unicode domain names", () => {
    expect(isValidUrl("https://xn--e1afmkfd.xn--p1ai")).toBe(true); // пример.рф
    expect(isValidUrl("https://例え.テスト")).toBe(true);
  });
});