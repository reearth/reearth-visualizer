import { Auth } from "@aws-amplify/auth";
import { logOutFromTenant } from "@reearth/services/config";
import { useState, useEffect } from "react";

import type { AuthHook } from "./authHook";

export const useCognitoAuth = (): AuthHook => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        setUser(cognitoUser);
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
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  };

  const login = () => {
    logOutFromTenant();
    Auth.federatedSignIn();
  };

  const logout = async () => {
    logOutFromTenant();
    try {
      await Auth.signOut();
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
