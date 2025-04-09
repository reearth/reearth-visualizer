import { useAuth0 } from "@auth0/auth0-react";
import { e2eAccessToken, logOutFromTenant } from "@reearth/services/config";
import { useEffect } from "react";

import type { AuthHook } from "./authHook";

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
        // Check if user has logged out since this page was cached
        const wasLoggedOut =
          localStorage.getItem("reearth_logged_out") === "true";

        if (wasLoggedOut && isAuthenticated && !isLoading) {
          // Clear Auth0 cached authentication state
          localStorage.removeItem("auth0.is.authenticated");

          // Force a clean reload rather than trying to redirect
          // This avoids potential issues with the Auth0 library state
          window.location.reload();
        }
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated: !!e2eAccessToken() || (isAuthenticated && !error),
    isLoading,
    error: error?.message ?? null,
    getAccessToken: () => getAccessTokenSilently(),
    login: () => {
      // Clear the logged out flag when explicitly logging in
      localStorage.removeItem("reearth_logged_out");
      logOutFromTenant();
      return loginWithRedirect();
    },
    logout: () => {
      // Set a flag in localStorage that we've logged out
      localStorage.setItem("reearth_logged_out", "true");

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
