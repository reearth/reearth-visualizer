import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { openUrlInNewTab } from "./utils";

describe("pluginAPI utils", () => {
  const originalConsoleError = console.error;
  const originalWindowOpen = window.open;
  
  beforeEach(() => {
    // Mock console.error
    console.error = vi.fn();
    // Mock window.open
    window.open = vi.fn();
  });

  afterEach(() => {
    // Restore original functions
    console.error = originalConsoleError;
    window.open = originalWindowOpen;
    vi.clearAllMocks();
  });

  describe("openUrlInNewTab", () => {
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

      it("should handle URLs with fragments", () => {
        const url = "https://example.com/path#section";
        
        openUrlInNewTab(url);
        
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });

      it("should handle URLs with ports", () => {
        const url = "https://example.com:8080/path";
        
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

      it("should not open malformed URLs and log error", () => {
        const malformedUrl = "://invalid";
        
        openUrlInNewTab(malformedUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", malformedUrl);
      });

      it("should handle non-string input gracefully", () => {
        const nonStringUrl = 123 as unknown as string;
        
        openUrlInNewTab(nonStringUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", nonStringUrl);
      });

      it("should handle null input gracefully", () => {
        const nullUrl = null as unknown as string;
        
        openUrlInNewTab(nullUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", nullUrl);
      });

      it("should handle undefined input gracefully", () => {
        const undefinedUrl = undefined as unknown as string;
        
        openUrlInNewTab(undefinedUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", undefinedUrl);
      });
    });

    describe("when called with potentially unsafe protocols", () => {
      it("should not open file:// URLs and log error", () => {
        const fileUrl = "file:///etc/passwd";
        
        openUrlInNewTab(fileUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", fileUrl);
      });

      it("should not open ftp:// URLs and log error", () => {
        const ftpUrl = "ftp://example.com/file.txt";
        
        openUrlInNewTab(ftpUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", ftpUrl);
      });

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

      it("should not open custom protocol URLs and log error", () => {
        const customUrl = "myapp://action";
        
        openUrlInNewTab(customUrl);
        
        expect(window.open).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Invalid URL", customUrl);
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

    describe("edge cases", () => {
      it("should handle URLs with special characters in domain", () => {
        const url = "https://xn--nxasmq6b.example.com"; // internationalized domain
        
        openUrlInNewTab(url);
        
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });

      it("should handle very long URLs", () => {
        const longPath = "a".repeat(2000);
        const url = `https://example.com/${longPath}`;
        
        openUrlInNewTab(url);
        
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });

      it("should handle URLs with encoded characters", () => {
        const url = "https://example.com/path%20with%20spaces?query=hello%20world";
        
        openUrlInNewTab(url);
        
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });

      it("should handle localhost URLs", () => {
        const url = "http://localhost:3000";
        
        openUrlInNewTab(url);
        
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });

      it("should handle IP address URLs", () => {
        const url = "https://192.168.1.1:8080";
        
        openUrlInNewTab(url);
        
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });
    });

    describe("when window.open fails", () => {
      it("should handle window.open returning null gracefully", () => {
        const url = "https://example.com";
        vi.mocked(window.open).mockReturnValue(null);
        
        expect(() => openUrlInNewTab(url)).not.toThrow();
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalled();
      });

      it("should call window.open with correct parameters even if it fails", () => {
        const url = "https://example.com";
        vi.mocked(window.open).mockImplementation(() => {
          throw new Error("Pop-up blocked");
        });
        
        expect(() => openUrlInNewTab(url)).toThrow("Pop-up blocked");
        expect(window.open).toHaveBeenCalledWith(url, "_blank", "noopener");
        expect(console.error).not.toHaveBeenCalledWith("Invalid URL", url);
      });
    });
  });
});