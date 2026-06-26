import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useHooks from "./hooks";

const fetchMore = vi.fn();
const fetchMoreStarred = vi.fn();
const refetch = vi.fn();
const navigate = vi.fn();

let capturedLoadMoreHandlers: (() => Promise<void> | void)[] = [];

vi.mock("react-router", () => ({
  useNavigate: () => navigate
}));

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

vi.mock("@reearth/services/config/appFeatureConfig", () => ({
  appFeature: () => ({ projectVisibility: true })
}));

vi.mock("@reearth/services/api/utils", () => ({
  toPublishmentStatus: vi.fn((status: string) => status?.toLowerCase())
}));

vi.mock("@reearth/services/gql", () => ({
  ProjectSortField: {
    Createdat: "CREATED_AT",
    Updatedat: "UPDATED_AT",
    Name: "NAME"
  },
  SortDirection: {
    Asc: "ASC",
    Desc: "DESC"
  },
  Visualizer: {
    Cesium: "CESIUM"
  }
}));

vi.mock("@reearth/services/api/project", () => ({
  useProjectMutations: () => ({
    updateProject: vi.fn(),
    createProject: vi.fn(),
    updateProjectRecycleBin: vi.fn(),
    publishProject: vi.fn()
  }),
  useProjects: () => ({
    projects: [],
    loading: false,
    isRefetching: false,
    hasMoreProjects: true,
    endCursor: "project-end-cursor",
    fetchMore,
    refetch
  }),
  useStarredProjects: () => ({
    starredProjects: [],
    hasMoreStarredProjects: true,
    endCursor: "starred-end-cursor",
    fetchMore: fetchMoreStarred
  })
}));

vi.mock("./useProjectImport", () => ({
  default: () => ({
    importStatus: undefined,
    handleProjectImport: vi.fn(),
    handleProjectImportErrorDownload: vi.fn(),
    handleProjectImportErrorClose: vi.fn()
  })
}));

describe("dashboard project hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedLoadMoreHandlers = [];
    localStorage.clear();
  });

  it("fetches more projects with the current end cursor", async () => {
    fetchMore.mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));

    // First useLoadMore call is for normal projects; second is for starred projects.
    const loadMoreProjects = capturedLoadMoreHandlers[0];

    await act(async () => {
      await loadMoreProjects();
    });

    expect(fetchMore).toHaveBeenCalledTimes(1);
    expect(fetchMore).toHaveBeenCalledWith({
      variables: {
        pagination: {
          after: "project-end-cursor",
          first: 16
        }
      }
    });
  });

  it("does not call fetchMore again while a fetch is already in progress", async () => {
    let resolveFetchMore: (value?: unknown) => void = () => undefined;
    fetchMore.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetchMore = resolve;
        })
    );

    renderHook(() => useHooks("workspace-id"));
    const loadMoreProjects = capturedLoadMoreHandlers[0];

    const firstCall = act(async () => {
      await loadMoreProjects();
    });

    await act(async () => {
      await loadMoreProjects();
    });

    expect(fetchMore).toHaveBeenCalledTimes(1);

    resolveFetchMore({});
    await firstCall;
  });

  
  it("resets the fetching guard after fetchMore succeeds so a subsequent call can run", async () => {
    fetchMore
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));
    const loadMoreProjects = capturedLoadMoreHandlers[0];

    await act(async () => {
      await loadMoreProjects();
    });

    await act(async () => {
      await loadMoreProjects();
    });

    expect(fetchMore).toHaveBeenCalledTimes(2);
  });

  it("resets the fetching guard after fetchMore fails so a later retry can run", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    fetchMore
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));
    const loadMoreProjects = capturedLoadMoreHandlers[0];

    await act(async () => {
      await loadMoreProjects();
    });

    await act(async () => {
      await loadMoreProjects();
    });

    expect(fetchMore).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch more projects:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});

describe("dashboard starred projects hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedLoadMoreHandlers = [];
    localStorage.clear();
  });

  it("fetches more starred projects with the current end cursor", async () => {
    fetchMoreStarred.mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));

    // Second useLoadMore call is for starred projects.
    const loadMoreStarred = capturedLoadMoreHandlers[1];

    await act(async () => {
      await loadMoreStarred();
    });

    expect(fetchMoreStarred).toHaveBeenCalledTimes(1);
    expect(fetchMoreStarred).toHaveBeenCalledWith({
      variables: {
        pagination: {
          after: "starred-end-cursor",
          first: 12
        }
      }
    });
  });

  it("does not call fetchMoreStarred again while a fetch is already in progress", async () => {
    let resolveFetchMoreStarred: (value?: unknown) => void = () => undefined;
    fetchMoreStarred.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetchMoreStarred = resolve;
        })
    );

    renderHook(() => useHooks("workspace-id"));
    const loadMoreStarred = capturedLoadMoreHandlers[1];

    const firstCall = act(async () => {
      await loadMoreStarred();
    });

    await act(async () => {
      await loadMoreStarred();
    });

    expect(fetchMoreStarred).toHaveBeenCalledTimes(1);

    resolveFetchMoreStarred({});
    await firstCall;
  });

  it("resets the fetching guard after fetchMoreStarred succeeds so a subsequent call can run", async () => {
    fetchMoreStarred
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));
    const loadMoreStarred = capturedLoadMoreHandlers[1];

    await act(async () => {
      await loadMoreStarred();
    });

    await act(async () => {
      await loadMoreStarred();
    });

    expect(fetchMoreStarred).toHaveBeenCalledTimes(2);
  });

  it("resets the fetching guard after fetchMoreStarred fails so a later retry can run", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    fetchMoreStarred
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({});

    renderHook(() => useHooks("workspace-id"));
    const loadMoreStarred = capturedLoadMoreHandlers[1];

    await act(async () => {
      await loadMoreStarred();
    });

    await act(async () => {
      await loadMoreStarred();
    });

    expect(fetchMoreStarred).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch more starred projects:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
