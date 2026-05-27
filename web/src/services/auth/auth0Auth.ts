import { useAuth0 } from "@auth0/auth0-react";
import { logOutFromTenant } from "@reearth/services/config";
import { useLatestLogoutAt } from "@reearth/services/state";
import { useCallback, useEffect } from "react";

import type { AuthHook } from "./authHook";
import { getJwtIat } from "./jwtUtils";

export const errorKey = "reeartherror";

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

  const [latestLogoutAt] = useLatestLogoutAt();

  const getAccessToken = useCallback(async () => {
    const token = await getAccessTokenSilently();

    if (latestLogoutAt !== null) {
      const iat = getJwtIat(token);
      if (iat !== null && latestLogoutAt > iat) {
        return getAccessTokenSilently({ cacheMode: "off" });
      }
    }

    return token;
  }, [getAccessTokenSilently, latestLogoutAt]);

  return {
    isAuthenticated: isAuthenticated && !error,
    isLoading,
    error: error?.message ?? null,
    getAccessToken,
    login: () => {
      logOutFromTenant();
      return loginWithRedirect();
    },
    logout: () => {
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
