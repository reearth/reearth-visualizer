import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCMSModelsAcrossProjects } from "./useCMSQueries";

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
});
