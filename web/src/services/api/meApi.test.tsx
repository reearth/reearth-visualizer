import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GET_ME, GET_USER_BY_SEARCH } from "@reearth/services/gql/queries/user";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import useMeApi from "./meApi";

const mockSetNotification = vi.fn();

vi.mock("../state", () => ({
  useNotification: () => [null, mockSetNotification]
}));

export const GET_ME_RESPONSE = {
  id: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  lang: "en",
  theme: "light",
  myTeam: {
    id: "team1",
    name: "Personal Team",
    policyId: "policy1",
    policy: {
      id: "policy1",
      name: "Basic Policy",
      projectCount: 10,
      memberCount: 5,
      publishedProjectCount: 3,
      layerCount: 15,
      assetStorageSize: 1024000
    }
  },
  teams: [
    {
      id: "team1",
      name: "Personal Team",
      personal: true,
      members: [
        {
          user: {
            id: "user123",
            name: "John Doe",
            email: "john.doe@example.com"
          },
          userId: "user123",
          role: "OWNER"
        }
      ],
      policyId: "policy1",
      policy: {
        id: "policy1",
        name: "Basic Policy",
        projectCount: 10,
        memberCount: 5,
        publishedProjectCount: 3,
        layerCount: 15,
        assetStorageSize: 1024000
      }
    }
  ],
  auths: ["password", "google"]
};

export const UPDATE_ME_RESPONSE = {
  data: {
    updateMe: {
      me: {
        id: "user123",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        lang: "en",
        theme: "dark",
        myTeam: {
          id: "team1",
          name: "Sarah's Workspace"
        }
      }
    }
  },
  status: "success"
};

const wrapper = ({
  children,
  mocks
}: {
  children: ReactNode;
  mocks: MockedResponse[];
}) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe("useMeApi", () => {
  const getMeMock = {
    request: {
      query: GET_ME
    },
    result: {
      data: {
        me: GET_ME_RESPONSE
      }
    }
  };

  it("should fetch user data with useMeQuery", async () => {
    const { result } = renderHook(() => useMeApi().useMeQuery(), {
      wrapper: ({ children }) => wrapper({ children, mocks: [getMeMock] })
    });

    // Increased timeout to give Apollo cache time to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.me).toEqual(GET_ME_RESPONSE);
  });

  it("should handle errors when fetching user data", async () => {
    const errorMock = {
      request: {
        query: GET_ME
      },
      error: new Error("Failed to fetch user data")
    };

    const { result } = renderHook(() => useMeApi().useMeQuery(), {
      wrapper: ({ children }) => wrapper({ children, mocks: [errorMock] })
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.error?.message).toBe("Failed to fetch user data");
  });

  it("should search for a user successfully", async () => {
    const searchMock = {
      request: {
        query: GET_USER_BY_SEARCH,
        variables: { nameOrEmail: "john.doe@example.com" }
      },
      result: {
        data: {
          searchUser: {
            id: "user123",
            name: "John Doe",
            email: "john.doe@example.com"
          }
        }
      }
    };

    const { result } = renderHook(
      () => useMeApi().useSearchUser("john.doe@example.com"),
      {
        wrapper: ({ children }) => wrapper({ children, mocks: [searchMock] })
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.user).toEqual({
      id: "user123",
      name: "John Doe",
      email: "john.doe@example.com"
    });
  });
});
