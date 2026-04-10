import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { isValidUrl, isSafeHttpUrl, openUrlInNewTab } from "./url";

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

describe("isSafeHttpUrl", () => {
  it("should return true for HTTP URLs", () => {
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
    expect(isSafeHttpUrl("http://localhost:3000")).toBe(true);
  });

  it("should return true for HTTPS URLs", () => {
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("https://example.com/path?query=value")).toBe(true);
  });

  it("should return false for non-HTTP protocols", () => {
    expect(isSafeHttpUrl("ftp://example.com")).toBe(false);
    expect(isSafeHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeHttpUrl("javascript:alert('xss')")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert('xss')</script>")).toBe(
      false
    );
  });

  it("should return false for invalid URLs", () => {
    expect(isSafeHttpUrl("not-a-url")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
    expect(isSafeHttpUrl("://invalid")).toBe(false);
  });
});

describe("openUrlInNewTab", () => {
  const originalConsoleError = console.error;
  const originalWindowOpen = window.open;

  beforeEach(() => {
    console.error = vi.fn();
    window.open = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    window.open = originalWindowOpen;
    vi.clearAllMocks();
  });

  describe("when called with valid HTTP URLs", () => {
    it("should open HTTP URLs in new tab with noopener", () => {
      const url = "http://example.com";
      openUrlInNewTab(url);
      expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should open HTTPS URLs in new tab with noopener", () => {
      const url = "https://example.com";
      openUrlInNewTab(url);
      expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should handle URLs with paths and query parameters", () => {
      const url = "https://example.com/path?param=value&foo=bar";
      openUrlInNewTab(url);
      expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe("when called with invalid URLs", () => {
    it("should not open invalid URLs and log error", () => {
      const invalidUrl = "not-a-url";
      openUrlInNewTab(invalidUrl);
      expect(window.open).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Invalid URL", invalidUrl);
    });

    it("should not open empty string and log error", () => {
      const emptyUrl = "";
      openUrlInNewTab(emptyUrl);
      expect(window.open).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Invalid URL", emptyUrl);
    });

    it("should handle non-string input gracefully", () => {
      const nonStringUrl = 123 as unknown as string;
      openUrlInNewTab(nonStringUrl);
      expect(window.open).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Invalid URL", nonStringUrl);
    });
  });

  describe("when called with potentially unsafe protocols", () => {
    it("should not open javascript: URLs and log error", () => {
      const jsUrl = "javascript:alert('xss')";
      openUrlInNewTab(jsUrl);
      expect(window.open).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Invalid URL", jsUrl);
    });

    it("should not open data: URLs and log error", () => {
      const dataUrl = "data:text/html,<script>alert('xss')</script>";
      openUrlInNewTab(dataUrl);
      expect(window.open).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Invalid URL", dataUrl);
    });

    it("should not open file: URLs and log error", () => {
      const fileUrl = "file:///etc/passwd";
      openUrlInNewTab(fileUrl);
      expect(window.open).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Invalid URL", fileUrl);
    });
  });

  describe("security considerations", () => {
    it("should always use 'noopener' attribute for security", () => {
      const url = "https://example.com";
      openUrlInNewTab(url);
      expect(window.open).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "noopener"
      );
    });

    it("should always use '_blank' target for new tab", () => {
      const url = "https://example.com";
      openUrlInNewTab(url);
      expect(window.open).toHaveBeenCalledWith(
        expect.any(String),
        "_blank",
        expect.any(String)
      );
    });
  });
});