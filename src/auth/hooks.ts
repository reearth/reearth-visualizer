import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export const errorKey = "reeartherror";

export default function useAuth() {
  const { isAuthenticated, error, isLoading, loginWithRedirect, logout, getAccessTokenSilently } =
    useAuth0();

  return {
    isAuthenticated: !!window.REEARTH_E2E_ACCESS_TOKEN || (isAuthenticated && !error),
    isLoading,
    error: error?.message,
    getAccessToken: () => getAccessTokenSilently(),
    login: () => loginWithRedirect(),
    logout: () =>
      logout({
        returnTo: error
          ? `${window.location.origin}?${errorKey}=${encodeURIComponent(error?.message)}`
          : window.location.origin,
      }),
  };
}

export function useCleanUrl() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (isLoading) return; // ensure that Auth0 can detect errors

    const params = new URLSearchParams(window.location.search);

    const error = params.get(errorKey);
    if (error) {
      setError(error);
    }

    params.delete("code");
    params.delete("state");
    params.delete(errorKey);

    const queries = params.toString();
    const url = `${window.location.pathname}${queries ? "?" : ""}${queries}`;

    history.replaceState(null, document.title, url);
  }, [isAuthenticated, isLoading]);

  return error;
}

export function useAuthenticationRequired(): [boolean, string | undefined] {
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
