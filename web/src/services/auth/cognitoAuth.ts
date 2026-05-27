import {
  getCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
  signOut,
  AuthUser
} from "@aws-amplify/auth";
import { logOutFromTenant } from "@reearth/services/config";
import { useState, useEffect } from "react";

import type { AuthHook } from "./authHook";

export const useCognitoAuth = (): AuthHook => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(JSON.stringify(err));
        }
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  const getAccessToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || "";
  };

  const login = () => {
    logOutFromTenant();
    signInWithRedirect();
  };

  const logout = async () => {
    logOutFromTenant();
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(JSON.stringify(err));
      }
    }
  };

  return {
    isAuthenticated: !!user,
    isLoading,
    error,
    getAccessToken,
    login,
    logout
  };
};
