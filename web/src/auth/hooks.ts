import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import { e2eAccessToken } from "@reearth/config";

export const errorKey = "reeartherror";

export default function useAuth() {
  const { isAuthenticated, error, isLoading, loginWithRedirect, logout, getAccessTokenSilently } =
    useAuth0();

  return {
    isAuthenticated: !!e2eAccessToken() || (isAuthenticated && !error),
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

export function useCleanUrl(): [string | undefined, boolean] {
  const { isLoading } = useAuth0();
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

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
    setDone(true);
  }, [isLoading]);

  return [error, done];
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

  const [error] = useCleanUrl();

  return [isAuthenticated, error];
}
