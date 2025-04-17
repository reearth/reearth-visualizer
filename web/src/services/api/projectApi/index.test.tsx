import { MockedProvider } from "@apollo/client/testing";
import { GET_PROJECT } from "@reearth/services/gql/queries/project";
import { renderHook } from "@reearth/test/utils";
import { describe, expect, it } from "vitest";

import useProjectApi from "./index";

describe("useProjectQuery", () => {
  it("should fetch project data when projectId is provided", async () => {
    const mockProjectId = "123";
    const mockProjectData = {
      node: {
        __typename: "Project",
        id: mockProjectId,
        name: "Test Project",
        scene: {
          id: "scene-123"
        },
        description: "Test Description",
        imageUrl: "https://example.com/image.png",
        isArchived: false,
        isBasicAuthActive: false,
        basicAuthUsername: "user",
        basicAuthPassword: "pass",
        publicTitle: "Public Title",
        publicDescription: "Public Description",
        publicImage: "https://example.com/public-image.png",
        alias: "test-alias",
        enableGa: false,
        trackingId: "UA-12345678-1",
        publishmentStatus: "published",
        updatedAt: "2025-04-17T00:00:00Z",
        createdAt: "2025-04-16T00:00:00Z",
        coreSupport: true,
        starred: false,
        isDeleted: false
      }
    };

    const mocks = [
      {
        request: {
          query: GET_PROJECT,
          variables: { projectId: mockProjectId }
        },
        result: { data: mockProjectData }
      }
    ];

    const { result } = renderHook(
      () => useProjectApi().useProjectQuery(mockProjectId),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={mocks} addTypename>
            {children}
          </MockedProvider>
        )
      }
    );

    expect(result.current.project).toBeUndefined();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.project).toEqual(mockProjectData.node);
  });

  it("should not fetch project data when projectId is not provided", () => {
    const { result } = renderHook(() => useProjectApi().useProjectQuery(), {
      wrapper: ({ children }) => <MockedProvider>{children}</MockedProvider>
    });

    expect(result.current.project).toBeUndefined();
  });
});
