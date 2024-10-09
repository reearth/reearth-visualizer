import { useState, useCallback, useEffect } from "react";

import type { AuthHook } from "./authHook";

export const useMockAuth = (): AuthHook => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
      setError(null);
    }, 1000);
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(null);
    }, 500);
  }, []);

  const getAccessToken = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      if (isAuthenticated) {
        setTimeout(() => {
          resolve("mock_access_token_" + Date.now());
        }, 100);
      } else {
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsLoading(false);
          setError(null);
          resolve("mock_access_token_" + Date.now());
        }, 500);
        // reject(new Error("Not authenticated"));
      }
    });
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    isLoading,
    error,
    getAccessToken,
    login,
    logout
  };
};
