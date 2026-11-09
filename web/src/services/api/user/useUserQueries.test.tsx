import { MockedProvider } from "@apollo/client/testing/react";
import { GET_USER_BY_SEARCH } from "@reearth/services/gql/queries/user";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSearchUser } from "./useUserQueries";

describe("useSearchUser", () => {
  it("returns the matching user with their name", async () => {
    const user = { id: "u1", name: "Display Name" };
    const { result } = renderHook(() => useSearchUser("user-alias"), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_USER_BY_SEARCH,
                variables: { nameOrEmail: "user-alias" }
              },
              result: { data: { searchUser: user } }
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
    expect(result.current.error).toBeUndefined();
  });

  it("exposes lookup failures to the caller", async () => {
    const failure = new Error("accounts unavailable");
    const { result } = renderHook(() => useSearchUser("user-alias"), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_USER_BY_SEARCH,
                variables: { nameOrEmail: "user-alias" }
              },
              error: failure
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    });

    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.user).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });
});
