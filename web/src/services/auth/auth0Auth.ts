import { useAuth0 } from "@auth0/auth0-react";
import { logOutFromTenant } from "@reearth/services/config";
import { useCallback, useEffect } from "react";

import type { AuthHook } from "./authHook";
import { getLatestLogoutAt } from "./logoutTimestamp";

export const errorKey = "reeartherror";

const getJwtIat = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.iat === "number" ? payload.iat : null;
  } catch {
    return null;
  }
};

const sendLogoutMutation = async (accessToken: string): Promise<void> => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        query: `mutation { logout { id } }`
      })
    });
  } catch {
    // Best-effort: don't block logout if mutation fails
  }
};

export const useAuth0Auth = (): AuthHook => {
  const {
    isAuthenticated,
    error,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  // Add handler for bfcache restoration
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // event.persisted is true when the page is restored from bfcache
      if (event.persisted) {
        // Simple reload
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const getAccessToken = useCallback(async () => {
    const token = await getAccessTokenSilently();

    const latestLogoutAt = getLatestLogoutAt();
    if (latestLogoutAt !== null) {
      const iat = getJwtIat(token);
      if (iat !== null && latestLogoutAt > iat) {
        return getAccessTokenSilently({ cacheMode: "off" });
      }
    }

    return token;
  }, [getAccessTokenSilently]);

  return {
    isAuthenticated: isAuthenticated && !error,
    isLoading,
    error: error?.message ?? null,
    getAccessToken,
    login: () => {
      logOutFromTenant();
      return loginWithRedirect();
    },
    logout: async () => {
      try {
        const token = await getAccessTokenSilently();
        await sendLogoutMutation(token);
      } catch {
        // Best-effort: proceed with logout even if mutation fails
      }

      logOutFromTenant();

      return logout({
        logoutParams: {
          returnTo: error
            ? `${window.location.origin}?${errorKey}=${encodeURIComponent(error?.message)}`
            : window.location.origin
        }
      });
    }
  };
};
