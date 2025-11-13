import JSZip from "jszip";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { fetchFile, fetchAndZipFiles } from "./file";

type MockResponse = {
  ok: boolean;
  text: () => Promise<string>;
  statusText: string;
};

global.fetch = vi.fn() as unknown as typeof fetch;
global.File = vi.fn() as unknown as typeof File;
vi.mock("jszip");

describe("fetchFile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch and return file content as text", async () => {
    const mockResponse: MockResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue("file content"),
      statusText: "OK"
    };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse as unknown as Response
    );

    const result = await fetchFile("https://example.com/file.txt");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/file.txt");
    expect(mockResponse.text).toHaveBeenCalled();
    expect(result).toBe("file content");
  });

  it("should throw an error when fetch fails", async () => {
    const mockResponse = {
      ok: false,
      statusText: "Not Found"
    };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse as unknown as Response
    );

    await expect(
      fetchFile("https://example.com/nonexistent.txt")
    ).rejects.toThrow(
      "Failed to fetch https://example.com/nonexistent.txt: Not Found"
    );
  });
});

describe("fetchAndZipFiles", () => {
  type MockZipInstance = {
    file: ReturnType<typeof vi.fn>;
    generateAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.resetAllMocks();

    const mockZipInstance: MockZipInstance = {
      file: vi.fn(),
      generateAsync: vi
        .fn()
        .mockResolvedValue(
          new Blob(["zipped content"], { type: "application/zip" })
        )
    };
    (JSZip as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      function () {
        return mockZipInstance;
      }
    );

    const mockResponse: MockResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue("file content"),
      statusText: "OK"
    };
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse as unknown as Response
    );

    (global.File as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      function (content: BlobPart[], name: string) {
        return {
          content,
          name
        };
      }
    );
  });

  it("should fetch multiple files and create a zip file", async () => {
    // Setup
    const urls = [
      "https://example.com/file1.txt",
      "https://example.com/file2.txt"
    ];

    const result = await fetchAndZipFiles(urls, "archive.zip");

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "https://example.com/file1.txt"
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "https://example.com/file2.txt"
    );

    const mockFn = JSZip as unknown as ReturnType<typeof vi.fn>;
    const zipInstance = mockFn.mock.results[0].value as MockZipInstance;
    expect(zipInstance.file).toHaveBeenCalledTimes(2);
    expect(zipInstance.file).toHaveBeenNthCalledWith(
      1,
      "file1.txt",
      "file content"
    );
    expect(zipInstance.file).toHaveBeenNthCalledWith(
      2,
      "file2.txt",
      "file content"
    );

    expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: "blob" });
    expect(global.File).toHaveBeenCalledWith([expect.any(Blob)], "archive.zip");

    expect(result).toBeDefined();
    expect(result?.name).toBe("archive.zip");
  });

  it("should handle failed fetches gracefully", async () => {
    // Setup
    console.error = vi.fn();

    const urls = [
      "https://example.com/file1.txt",
      "https://example.com/file2.txt"
    ];

    const mockSuccessResponse: MockResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue("file content"),
      statusText: "OK"
    };
    const mockFailResponse = {
      ok: false,
      statusText: "Not Found"
    };

    const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch
      .mockResolvedValueOnce(mockSuccessResponse as unknown as Response)
      .mockResolvedValueOnce(mockFailResponse as unknown as Response);

    const result = await fetchAndZipFiles(urls, "archive.zip");

    const mockJSZip = JSZip as unknown as ReturnType<typeof vi.fn>;
    const zipInstance = mockJSZip.mock.results[0].value as MockZipInstance;
    expect(zipInstance.file).toHaveBeenCalledTimes(1);
    expect(zipInstance.file).toHaveBeenCalledWith("file1.txt", "file content");
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch https://example.com/file2.txt:",
      expect.any(Error)
    );

    expect(result).toBeDefined();
  });

  it("should return undefined if filename cannot be extracted from URL", async () => {
    const urls = ["https://example.com/"]; // No filename in this URL

    const result = await fetchAndZipFiles(urls, "archive.zip");

    expect(result).toBeUndefined();
  });

  it("should handle errors during zip generation", async () => {
    console.error = vi.fn();

    const urls = ["https://example.com/file1.txt"];

    const mockZipInstance: MockZipInstance = {
      file: vi.fn(),
      generateAsync: vi
        .fn()
        .mockRejectedValue(new Error("Zip generation failed"))
    };
    (JSZip as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      function () {
        return mockZipInstance;
      }
    );

    const result = await fetchAndZipFiles(urls, "archive.zip");

    expect(console.error).toHaveBeenCalledWith(
      "Error generating ZIP file:",
      expect.any(Error)
    );
    expect(result).toBeUndefined();
  });
});
