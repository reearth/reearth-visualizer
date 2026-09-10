import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useHooks from "./hooks";

const mocks = vi.hoisted(() => ({
  fetchMoreDeleted: vi.fn(),
  refetch: vi.fn(),
  updateProjectRecycleBin: vi.fn(),
  deleteProject: vi.fn(),
  cacheIdentify: vi.fn((o: { id: string }) => `Project:${o.id}`),
  cacheEvict: vi.fn(),
  cacheGc: vi.fn(),
  // Mutable so individual tests can control what the query returns.
  deletedProjects: [] as unknown[]
}));

let capturedLoadMoreHandlers: (() => Promise<void> | void)[] = [];

vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({
    cache: {
      identify: mocks.cacheIdentify,
      evict: mocks.cacheEvict,
      gc: mocks.cacheGc
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
    updateProjectRecycleBin: mocks.updateProjectRecycleBin,
    deleteProject: mocks.deleteProject
  }),
  useDeletedProjects: () => ({
    deletedProjects: mocks.deletedProjects,
    hasMoreDeletedProjects: true,
    loading: false,
    refetch: mocks.refetch,
    endCursor: "deleted-end-cursor",
    fetchMore: mocks.fetchMoreDeleted
  })
}));

describe("recycle bin hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedLoadMoreHandlers = [];
    mocks.deletedProjects = [];
    mocks.cacheIdentify.mockImplementation(
      (o: { id: string }) => `Project:${o.id}`
    );
    mocks.deleteProject.mockResolvedValue({ status: "success" });
    mocks.updateProjectRecycleBin.mockResolvedValue({ status: "success" });
  });

  describe("pagination", () => {
    it("fetches more deleted projects with the current end cursor", async () => {
      mocks.fetchMoreDeleted.mockResolvedValueOnce({});

      renderHook(() => useHooks("workspace-id"));

      const loadMoreDeleted = capturedLoadMoreHandlers[0];

      await act(async () => {
        await loadMoreDeleted();
      });

      expect(mocks.fetchMoreDeleted).toHaveBeenCalledTimes(1);
      expect(mocks.fetchMoreDeleted).toHaveBeenCalledWith({
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
      mocks.fetchMoreDeleted.mockImplementationOnce(
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

      expect(mocks.fetchMoreDeleted).toHaveBeenCalledTimes(1);

      resolveFetchMoreDeleted({});
      await firstCall;
    });

    it("resets the fetching guard after fetchMoreDeleted succeeds so a subsequent call can run", async () => {
      mocks.fetchMoreDeleted.mockResolvedValueOnce({}).mockResolvedValueOnce({});

      renderHook(() => useHooks("workspace-id"));
      const loadMoreDeleted = capturedLoadMoreHandlers[0];

      await act(async () => {
        await loadMoreDeleted();
      });

      await act(async () => {
        await loadMoreDeleted();
      });

      expect(mocks.fetchMoreDeleted).toHaveBeenCalledTimes(2);
    });

    it("resets the fetching guard after fetchMoreDeleted fails so a later retry can run", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      mocks.fetchMoreDeleted
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

      expect(mocks.fetchMoreDeleted).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch more deleted projects:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("deleted project list", () => {
    it("drops null nodes and maps the rest to deleted projects", () => {
      mocks.deletedProjects = [
        {
          id: "p1",
          name: "Project One",
          imageUrl: "https://example.com/1.png",
          isDeleted: true,
          visibility: "public",
          starred: false,
          updatedAt: "2026-01-01T00:00:00.000Z"
        },
        null
      ];

      const { result } = renderHook(() => useHooks("workspace-id"));

      expect(result.current.filteredDeletedProjects).toHaveLength(1);
      expect(result.current.filteredDeletedProjects[0]).toMatchObject({
        id: "p1",
        name: "Project One",
        visibility: "public"
      });
      expect(result.current.filteredDeletedProjects[0].updatedAt).toBeInstanceOf(
        Date
      );
    });

    it("does not refetch on mount — the query revalidates itself", () => {
      renderHook(() => useHooks("workspace-id"));

      expect(mocks.refetch).not.toHaveBeenCalled();
    });
  });

  describe("permanent delete", () => {
    it("evicts the project from the cache once the delete succeeds", async () => {
      const { result } = renderHook(() => useHooks("workspace-id"));

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.handleProjectDelete("p1");
      });

      expect(deleted).toBe(true);
      expect(mocks.deleteProject).toHaveBeenCalledWith({ projectId: "p1" });
      expect(mocks.cacheEvict).toHaveBeenCalledWith({ id: "Project:p1" });
      expect(mocks.cacheGc).toHaveBeenCalledTimes(1);
    });

    it("leaves the cache untouched when the delete mutation reports an error", async () => {
      mocks.deleteProject.mockResolvedValueOnce({ status: "error" });

      const { result } = renderHook(() => useHooks("workspace-id"));

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.handleProjectDelete("p1");
      });

      expect(deleted).toBe(false);
      expect(mocks.cacheEvict).not.toHaveBeenCalled();
      expect(mocks.cacheGc).not.toHaveBeenCalled();
    });

    it("leaves the cache untouched when the delete mutation throws", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      mocks.deleteProject.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useHooks("workspace-id"));

      let deleted: boolean | undefined;
      await act(async () => {
        deleted = await result.current.handleProjectDelete("p1");
      });

      expect(deleted).toBe(false);
      expect(mocks.cacheEvict).not.toHaveBeenCalled();
      expect(mocks.cacheGc).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("ignores a second delete while one is still in flight", async () => {
      let resolveDelete: (value: { status: string }) => void = () => undefined;
      mocks.deleteProject.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          })
      );

      const { result } = renderHook(() => useHooks("workspace-id"));

      let first: Promise<boolean> | undefined;
      act(() => {
        first = result.current.handleProjectDelete("p1");
      });

      await act(async () => {
        await result.current.handleProjectDelete("p2");
      });

      expect(mocks.deleteProject).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveDelete({ status: "success" });
        await first;
      });
    });

    it("disables recycle bin actions while the delete runs and re-enables afterwards", async () => {
      let resolveDelete: (value: { status: string }) => void = () => undefined;
      mocks.deleteProject.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          })
      );

      const { result } = renderHook(() => useHooks("workspace-id"));
      expect(result.current.disabled).toBe(false);

      let pending: Promise<boolean> | undefined;
      act(() => {
        pending = result.current.handleProjectDelete("p1");
      });
      expect(result.current.disabled).toBe(true);

      await act(async () => {
        resolveDelete({ status: "success" });
        await pending;
      });
      expect(result.current.disabled).toBe(false);
    });
  });

  describe("recovery", () => {
    it("takes the project out of the recycle bin and reports success", async () => {
      const { result } = renderHook(() => useHooks("workspace-id"));

      let recovered: boolean | undefined;
      await act(async () => {
        recovered = await result.current.handleProjectRecovery({
          id: "p1",
          name: "Project One"
        });
      });

      expect(recovered).toBe(true);
      expect(mocks.updateProjectRecycleBin).toHaveBeenCalledWith({
        projectId: "p1",
        deleted: false
      });
    });

    it("reports failure when the recovery mutation errors", async () => {
      mocks.updateProjectRecycleBin.mockResolvedValueOnce({ status: "error" });

      const { result } = renderHook(() => useHooks("workspace-id"));

      let recovered: boolean | undefined;
      await act(async () => {
        recovered = await result.current.handleProjectRecovery({
          id: "p1",
          name: "Project One"
        });
      });

      expect(recovered).toBe(false);
    });

    it("ignores a second recovery while one is still in flight", async () => {
      let resolveRecovery: (value: { status: string }) => void = () => undefined;
      mocks.updateProjectRecycleBin.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRecovery = resolve;
          })
      );

      const { result } = renderHook(() => useHooks("workspace-id"));

      let first: Promise<boolean> | undefined;
      act(() => {
        first = result.current.handleProjectRecovery({
          id: "p1",
          name: "Project One"
        });
      });

      await act(async () => {
        await result.current.handleProjectRecovery({
          id: "p1",
          name: "Project One"
        });
      });

      expect(mocks.updateProjectRecycleBin).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveRecovery({ status: "success" });
        await first;
      });
    });

    it("does nothing without a project", async () => {
      const { result } = renderHook(() => useHooks("workspace-id"));

      let recovered: boolean | undefined;
      await act(async () => {
        recovered = await result.current.handleProjectRecovery(undefined);
      });

      expect(recovered).toBe(false);
      expect(mocks.updateProjectRecycleBin).not.toHaveBeenCalled();
    });
  });
});
