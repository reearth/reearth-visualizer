import { useAuth0 } from "@auth0/auth0-react";
import { logOutFromTenant } from "@reearth/services/config";
import { useEffect, useRef } from "react";

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

  const firstCheckRef = useRef(true);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return {
    isAuthenticated: isAuthenticated && !error,
    isLoading,
    error: error?.message ?? null,

    getAccessToken: async () => {
      const options = firstCheckRef.current
        ? { cacheMode: "off" as const }
        : undefined;

      try {
        return await getAccessTokenSilently(options);
      } finally {
        firstCheckRef.current = false;
      }
    },

    login: () => {
      logOutFromTenant();
      return loginWithRedirect();
    },

    logout: () => {
      logOutFromTenant();
      return logout({
        logoutParams: {
          returnTo: error
            ? `${window.location.origin}?${errorKey}=${encodeURIComponent(error.message)}`
            : window.location.origin
        }
      });
    }
  };
};
