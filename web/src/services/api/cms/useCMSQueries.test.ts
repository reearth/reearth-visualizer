import { useQuery } from "@apollo/client/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CMS_PAGE_SIZE,
  useCMSModelsAcrossProjects,
  useCMSProjects
} from "./useCMSQueries";

const query = vi.fn();

vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({ query }),
  useQuery: vi.fn()
}));

const model = (id: string, projectId: string) => ({ id, projectId });

describe("useCMSModelsAcrossProjects", () => {
  beforeEach(() => {
    query.mockReset();
    query.mockImplementation(
      async ({ variables }: { variables: { projectId: string } }) => ({
        data: {
          cmsModels: {
            totalCount: 1,
            nodes: [model(`m-${variables.projectId}`, variables.projectId)]
          }
        }
      })
    );
  });

  it("merges every project's models", async () => {
    const { result } = renderHook(() =>
      useCMSModelsAcrossProjects({
        workspaceId: "ws",
        projectIds: ["p1", "p2"]
      })
    );
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.models.map((m) => m.id)).toEqual(["m-p1", "m-p2"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("leaves out a project that fails", async () => {
    query.mockImplementation(
      async ({ variables }: { variables: { projectId: string } }) => {
        if (variables.projectId === "p2") throw new Error("denied");
        return {
          data: { cmsModels: { totalCount: 1, nodes: [model("m-p1", "p1")] } }
        };
      }
    );
    const { result } = renderHook(() =>
      useCMSModelsAcrossProjects({
        workspaceId: "ws",
        projectIds: ["p1", "p2"]
      })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.models.map((m) => m.id)).toEqual(["m-p1"]);
  });

  it("keeps what it loaded while skipped, without fetching again", async () => {
    const { result, rerender } = renderHook(
      ({ skip }) =>
        useCMSModelsAcrossProjects({
          workspaceId: "ws",
          projectIds: ["p1", "p2"],
          skip
        }),
      { initialProps: { skip: false } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(query).toHaveBeenCalledTimes(2);

    // e.g. one project picked, then back to all projects.
    rerender({ skip: true });
    rerender({ skip: false });

    expect(result.current.loading).toBe(false);
    expect(result.current.models.map((m) => m.id)).toEqual(["m-p1", "m-p2"]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("loads the next page of every project that has more", async () => {
    // p1 has two pages, p2 one.
    query.mockImplementation(
      async ({
        variables: { projectId, page }
      }: {
        variables: { projectId: string; page: number };
      }) => {
        const totalCount = projectId === "p1" ? CMS_PAGE_SIZE + 1 : 1;
        const count =
          page === 1
            ? Math.min(totalCount, CMS_PAGE_SIZE)
            : totalCount - CMS_PAGE_SIZE;
        return {
          data: {
            cmsModels: {
              totalCount,
              nodes: Array.from({ length: count }, (_, i) =>
                model(`${projectId}-${page}-${i}`, projectId)
              )
            }
          }
        };
      }
    );
    const { result } = renderHook(() =>
      useCMSModelsAcrossProjects({
        workspaceId: "ws",
        projectIds: ["p1", "p2"]
      })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.models).toHaveLength(CMS_PAGE_SIZE + 1);
    expect(result.current.hasMore).toBe(true);

    await act(() => result.current.loadMore());

    expect(query).toHaveBeenCalledTimes(3);
    expect(query).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ projectId: "p1", page: 2 })
      })
    );
    expect(result.current.models).toHaveLength(CMS_PAGE_SIZE + 2);
    // Appended after p1's first page, before p2's.
    expect(result.current.models[CMS_PAGE_SIZE].id).toBe("p1-2-0");
    expect(result.current.hasMore).toBe(false);
  });

  it("retries a failed project when used again, keeping the others", async () => {
    let p2Fails = true;
    query.mockImplementation(
      async ({ variables }: { variables: { projectId: string } }) => {
        if (variables.projectId === "p2" && p2Fails) throw new Error("down");
        return {
          data: {
            cmsModels: {
              totalCount: 1,
              nodes: [model(`m-${variables.projectId}`, variables.projectId)]
            }
          }
        };
      }
    );
    const { result, rerender } = renderHook(
      ({ skip }) =>
        useCMSModelsAcrossProjects({
          workspaceId: "ws",
          projectIds: ["p1", "p2"],
          skip
        }),
      { initialProps: { skip: false } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.models.map((m) => m.id)).toEqual(["m-p1"]);

    p2Fails = false;
    rerender({ skip: true });
    rerender({ skip: false });

    await waitFor(() =>
      expect(result.current.models.map((m) => m.id)).toEqual(["m-p1", "m-p2"])
    );
    // Only p2 is fetched again.
    expect(query).toHaveBeenCalledTimes(3);
  });

  it("counts a project whose next page fails, and stops loading it", async () => {
    query.mockImplementation(
      async ({ variables: { page } }: { variables: { page: number } }) => {
        if (page > 1) throw new Error("down");
        return {
          data: {
            cmsModels: {
              totalCount: CMS_PAGE_SIZE * 2,
              nodes: [model("m-p1", "p1")]
            }
          }
        };
      }
    );
    const { result } = renderHook(() =>
      useCMSModelsAcrossProjects({ workspaceId: "ws", projectIds: ["p1"] })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.failedCount).toBe(0);

    await act(() => result.current.loadMore());

    expect(result.current.failedCount).toBe(1);
    expect(result.current.models.map((m) => m.id)).toEqual(["m-p1"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("pages by the page loaded, not by the item count", async () => {
    // Every page is shorter than CMS_PAGE_SIZE.
    query.mockImplementation(
      async ({ variables: { page } }: { variables: { page: number } }) => ({
        data: {
          cmsModels: {
            totalCount: CMS_PAGE_SIZE * 3,
            nodes: [model(`m-${page}`, "p1")]
          }
        }
      })
    );
    const { result } = renderHook(() =>
      useCMSModelsAcrossProjects({ workspaceId: "ws", projectIds: ["p1"] })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.loadMore());
    await act(() => result.current.loadMore());

    expect(result.current.models.map((m) => m.id)).toEqual([
      "m-1",
      "m-2",
      "m-3"
    ]);
    expect(result.current.hasMore).toBe(false);
  });
});

describe("useCMSProjects", () => {
  it("fetches the pages after the first until every project is loaded", async () => {
    // Kept pending: once page 2 has loaded, nothing is left to fetch.
    const fetchMore = vi.fn(() => new Promise(() => undefined));
    vi.mocked(useQuery).mockReturnValue({
      data: {
        cmsProjects: {
          totalCount: 150,
          nodes: Array.from({ length: 100 }, (_, i) => ({ id: `p${i}` }))
        }
      },
      loading: false,
      error: undefined,
      fetchMore
    } as unknown as ReturnType<typeof useQuery>);

    const { result } = renderHook(() => useCMSProjects({ workspaceId: "ws" }));

    await waitFor(() =>
      expect(fetchMore).toHaveBeenCalledWith({ variables: { page: 2 } })
    );
    // Still loading until the remaining projects arrive.
    expect(result.current.loading).toBe(true);
  });

  it("stops loading and returns the error when a page fails", async () => {
    const fetchMore = vi.fn().mockRejectedValue(new Error("down"));
    vi.mocked(useQuery).mockReturnValue({
      data: {
        cmsProjects: {
          totalCount: 150,
          nodes: Array.from({ length: 100 }, (_, i) => ({ id: `p${i}` }))
        }
      },
      loading: false,
      error: undefined,
      fetchMore
    } as unknown as ReturnType<typeof useQuery>);

    const { result } = renderHook(() => useCMSProjects({ workspaceId: "ws" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toEqual(new Error("down"));
    expect(result.current.projects).toHaveLength(100);
    expect(fetchMore).toHaveBeenCalledTimes(1);
  });
});
