import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useHooks from "./hooks";

const fetchMoreDeleted = vi.fn();
const refetch = vi.fn();

let capturedLoadMoreHandlers: (() => Promise<void> | void)[] = [];

vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({
    cache: {
      identify: vi.fn(),
      evict: vi.fn(),
      gc: vi.fn()
    }
  })
}));

vi.mock("@reearth/app/hooks/useLoadMore", () => ({
  default: vi.fn(({ onLoadMore }) => {
    capturedLoadMoreHandlers.push(onLoadMore);
    return {
      wrapperRef: { current: null },
      contentRef: { current: null }
    };
  })
}));

vi.mock("@reearth/services/api/project", () => ({
  useProjectMutations: () => ({
    updateProjectRecycleBin: vi.fn(),
    deleteProject: vi.fn()
  }),
  useDeletedProjects: () => ({
    deletedProjects: [],
    hasMoreDeletedProjects: true,
    loading: false,
    refetch,
    endCursor: "deleted-end-cursor",
    fetchMore: fetchMoreDeleted
  })
}));

describe("recycle bin hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedLoadMoreHandlers = [];
  });

  it("fetches more deleted projects with the current end cursor", async () => {
    fetchMoreDeleted.mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));

    const loadMoreDeleted = capturedLoadMoreHandlers[0];

    await act(async () => {
      await loadMoreDeleted();
    });

    expect(fetchMoreDeleted).toHaveBeenCalledTimes(1);
    expect(fetchMoreDeleted).toHaveBeenCalledWith({
      variables: {
        pagination: {
          after: "deleted-end-cursor",
          first: 16
        }
      }
    });
  });

  it("does not call fetchMoreDeleted again while a fetch is already in progress", async () => {
    let resolveFetchMoreDeleted: (value?: unknown) => void = () => undefined;
    fetchMoreDeleted.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetchMoreDeleted = resolve;
        })
    );

    renderHook(() => useHooks("workspace-id"));
    const loadMoreDeleted = capturedLoadMoreHandlers[0];

    const firstCall = act(async () => {
      await loadMoreDeleted();
    });

    await act(async () => {
      await loadMoreDeleted();
    });

    expect(fetchMoreDeleted).toHaveBeenCalledTimes(1);

    resolveFetchMoreDeleted({});
    await firstCall;
  });

  it("resets the fetching guard after fetchMoreDeleted succeeds so a subsequent call can run", async () => {
    fetchMoreDeleted
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));
    const loadMoreDeleted = capturedLoadMoreHandlers[0];

    await act(async () => {
      await loadMoreDeleted();
    });

    await act(async () => {
      await loadMoreDeleted();
    });

    expect(fetchMoreDeleted).toHaveBeenCalledTimes(2);
  });

  it("resets the fetching guard after fetchMoreDeleted fails so a later retry can run", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    fetchMoreDeleted
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));
    const loadMoreDeleted = capturedLoadMoreHandlers[0];

    await act(async () => {
      await loadMoreDeleted();
    });

    await act(async () => {
      await loadMoreDeleted();
    });

    expect(fetchMoreDeleted).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch more deleted projects:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
