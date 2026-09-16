import { ProjectImportStatus } from "@reearth/services/gql";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useProjectImport from "./useProjectImport";

const mockImportProject = vi.fn();
const mockImportProjectWithSplitImport = vi.fn();
const mockRefetchProject = vi.fn();
const mockAppFeature = vi.fn(() => ({ useProjectSplitImport: false }));

vi.mock("@reearth/services/api/project", () => ({
  useProject: () => ({ refetch: mockRefetchProject }),
  useProjectImportExportMutations: () => ({
    importProject: mockImportProject,
    importProjectWithSplitImport: mockImportProjectWithSplitImport
  })
}));

vi.mock("@reearth/services/config/appFeatureConfig", () => ({
  appFeature: () => mockAppFeature()
}));

const refetchResult = (status?: ProjectImportStatus, importResultLog?: unknown) => ({
  data: status
    ? {
        node: {
          __typename: "Project",
          metadata: { importStatus: status, importResultLog }
        }
      }
    : {}
});

const createChangeEvent = (file?: File) =>
  ({ target: { files: file ? [file] : [] } }) as unknown as React.ChangeEvent<HTMLInputElement>;

const startImport = async (
  result: { current: ReturnType<typeof useProjectImport> },
  fileName = "project.zip"
) => {
  await act(async () => {
    await result.current.handleProjectImport(
      createChangeEvent(new File(["data"], fileName))
    );
  });
};

describe("useProjectImport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockAppFeature.mockReturnValue({ useProjectSplitImport: false });
    mockImportProject.mockResolvedValue({
      status: "uploaded",
      project_id: "project-1"
    });

    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("revokes the object URL and removes the temporary anchor after downloading the error log", async () => {
    mockRefetchProject.mockResolvedValueOnce(
      refetchResult(ProjectImportStatus.Failed, { message: "boom" })
    );

    const { result } = renderHook(() =>
      useProjectImport({ workspaceId: "workspace-1", refetchProjectList: vi.fn() })
    );

    await startImport(result);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(result.current.importStatus).toBe(ProjectImportStatus.Failed);

    const bodyChildrenBefore = document.body.childElementCount;

    act(() => {
      result.current.handleProjectImportErrorDownload();
    });

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    // The temporary anchor used to trigger the download must not linger in
    // the DOM after the click.
    expect(document.body.childElementCount).toBe(bodyChildrenBefore);
  });

  it("keeps the last known status when a poll tick can't resolve the project", async () => {
    mockRefetchProject
      .mockResolvedValueOnce(refetchResult(ProjectImportStatus.Processing))
      // A transient/ambiguous response (no resolvable Project node).
      .mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() =>
      useProjectImport({ workspaceId: "workspace-1", refetchProjectList: vi.fn() })
    );

    await startImport(result);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(result.current.importStatus).toBe(ProjectImportStatus.Processing);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    // Must not have been reset to None just because one poll tick was
    // ambiguous — that would hide import progress from the user.
    expect(result.current.importStatus).toBe(ProjectImportStatus.Processing);
  });

  it("still resets to None when the server explicitly reports None", async () => {
    mockRefetchProject
      .mockResolvedValueOnce(refetchResult(ProjectImportStatus.Processing))
      .mockResolvedValueOnce(refetchResult(ProjectImportStatus.None));

    const { result } = renderHook(() =>
      useProjectImport({ workspaceId: "workspace-1", refetchProjectList: vi.fn() })
    );

    await startImport(result);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(result.current.importStatus).toBe(ProjectImportStatus.Processing);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(result.current.importStatus).toBe(ProjectImportStatus.None);
  });

  it("surfaces a Failed status with its error log for the ProjectImportErrorModal", async () => {
    mockRefetchProject.mockResolvedValueOnce(
      refetchResult(ProjectImportStatus.Failed, { message: "corrupt archive" })
    );

    const { result } = renderHook(() =>
      useProjectImport({ workspaceId: "workspace-1", refetchProjectList: vi.fn() })
    );

    await startImport(result);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(result.current.importStatus).toBe(ProjectImportStatus.Failed);

    act(() => {
      result.current.handleProjectImportErrorClose();
    });

    expect(result.current.importStatus).toBe(ProjectImportStatus.None);
  });
});
