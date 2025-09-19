import { MockedProvider } from "@apollo/client/testing";
import { renderHook, act } from "@testing-library/react";
import type { AxiosInstance } from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { useProjectImportExportMutations } from "./useProjectImportExportMutations";

// === Create mocks ===
const mockNotification = vi.fn();
const mockAxiosPost = vi.fn();

const mockAxios: Partial<AxiosInstance> = {
  post: mockAxiosPost
};

// === Mock external modules ===
vi.mock("uuid", () => ({ v4: () => "mock-file-id" }));

vi.mock("@reearth/services/i18n", () => ({
  useT: () => (key: string) => key,
  useLang: () => "en"
}));

vi.mock("@reearth/services/state", () => ({
  useNotification: () => [undefined, mockNotification]
}));

vi.mock("@reearth/services/restful", () => ({
  useRestful: () => ({ axios: mockAxios })
}));

// === Apollo context wrapper ===
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={[]} addTypename={false}>
    {children}
  </MockedProvider>
);

describe("useProjectApi - useImportProject", () => {
  const CHUNK_SIZE = 16 * 1024 * 1024;

  beforeEach(() => {
    mockNotification.mockReset();
    mockAxiosPost.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("handles successful upload of a single-chunk file", async () => {
    const file = new File(["test"], "test.zip", { type: "application/zip" });
    const workspaceId = "team-123";

    mockAxiosPost.mockResolvedValueOnce({ data: { status: "chunk_received" } });

    const { result } = renderHook(() => useProjectImportExportMutations(), {
      wrapper
    });

    let res;
    await act(async () => {
      res = await result.current.importProject(file, workspaceId);
    });

    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ status: "chunk_received" });
  });

  it("handles successful upload of a multi-chunk file", async () => {
    const largeFileSize = CHUNK_SIZE * 2.5;
    const buffer = new Uint8Array(largeFileSize).fill(97);
    const file = new File([buffer], "large.zip", {
      type: "application/zip"
    });
    const workspaceId = "team-123";

    mockAxiosPost
      .mockResolvedValueOnce({ data: { status: "processing" } })
      .mockResolvedValueOnce({ data: { status: "processing" } })
      .mockResolvedValueOnce({ data: { status: "chunk_received" } });

    const { result } = renderHook(() => useProjectImportExportMutations(), {
      wrapper
    });

    let res;
    await act(async () => {
      res = await result.current.importProject(file, workspaceId);
    });

    expect(mockAxiosPost).toHaveBeenCalledTimes(3);
    expect(res).toEqual({ status: "chunk_received" });
  });

  it("aborts upload if one chunk fails in the middle", async () => {
    const largeFileSize = CHUNK_SIZE * 2.5;
    const buffer = new Uint8Array(largeFileSize).fill(97);
    const file = new File([buffer], "fail-in-middle.zip", {
      type: "application/zip"
    });
    const workspaceId = "team-123";

    mockAxiosPost.mockImplementation((_url, formData) => {
      const chunkNum = formData.get("chunk_num");
      if (chunkNum === "1") {
        return Promise.reject(new Error("simulated chunk 1 failure"));
      }

      return Promise.resolve({ data: { status: "chunk_received" } });
    });

    const { result } = renderHook(() => useProjectImportExportMutations(), {
      wrapper
    });

    let res;
    await act(async () => {
      res = await result.current.importProject(file, workspaceId);
    });

    expect(mockAxiosPost).toHaveBeenCalledTimes(3);
    expect(mockNotification).toHaveBeenCalledWith({
      type: "error",
      text: "Failed to import project."
    });
    expect(res).toEqual({ status: "error" });
  });

  it("handles failure during upload", async () => {
    const file = new File(["data"], "fail.zip", { type: "application/zip" });
    const workspaceId = "team-123";

    mockAxiosPost.mockRejectedValueOnce({
      error: "Error by purpose: Network error"
    });

    const { result } = renderHook(() => useProjectImportExportMutations(), {
      wrapper
    });

    let res;
    await act(async () => {
      res = await result.current.importProject(file, workspaceId);
    });

    expect(mockNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        text: expect.stringContaining("Failed")
      })
    );

    expect(res).toEqual({ status: "error" });
  });

  it("handles empty files", async () => {
    const file = new File([""], "empty.zip", { type: "application/zip" });
    const workspaceId = "team-123";

    mockAxiosPost.mockResolvedValueOnce({ data: { status: "chunk_received" } });

    const { result } = renderHook(() => useProjectImportExportMutations(), {
      wrapper
    });

    let res;
    await act(async () => {
      res = await result.current.importProject(file, workspaceId);
    });
    expect(res).toEqual({ status: "chunk_received" });
  });
});
