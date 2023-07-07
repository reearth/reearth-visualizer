import { useAuth0 } from "@auth0/auth0-react";

import { e2eAccessToken } from "@reearth/services/config";

import type { AuthHook } from "./authHook";

export const errorKey = "reeartherror";

export const useAuth0Auth = (): AuthHook => {
  const { isAuthenticated, error, isLoading, loginWithRedirect, logout, getAccessTokenSilently } =
    useAuth0();

  return {
    isAuthenticated: !!e2eAccessToken() || (isAuthenticated && !error),
    isLoading,
    error: error?.message ?? null,
    getAccessToken: () => getAccessTokenSilently(),
    login: () => loginWithRedirect(),
    logout: () =>
      logout({
        logoutParams: {
          returnTo: error
            ? `${window.location.origin}?${errorKey}=${encodeURIComponent(error?.message)}`
            : window.location.origin,
        },
      }),
  };
};
