import { useEffect } from "react";

import { useAuth, useCleanUrl } from "@reearth/auth";

export default function useAuthenticationRequired(): [boolean, string | undefined] {
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    if (authError) {
      logout();
      return;
    }

    login();
  }, [authError, isAuthenticated, isLoading, login, logout]);

  const error = useCleanUrl();

  return [isAuthenticated, error];
}
