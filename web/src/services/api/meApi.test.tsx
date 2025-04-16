import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GET_ME } from "@reearth/services/gql/queries/user";
import { act, renderHook } from "@testing-library/react";
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

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.me).toEqual(GET_ME_RESPONSE);
  });

  it.skip("should update user password with useUpdatePassword", async () => {
    const { result } = renderHook(() => useMeApi().useUpdatePassword);

    await act(async () => {
      const response = await result.current({
        password: "newpassword",
        passwordConfirmation: "newpassword"
      });

      expect(response.status).toBe("success");
      expect(mockSetNotification).toHaveBeenCalledWith({
        type: "success",
        text: "Successfully updated user password!"
      });
    });
  });
});
