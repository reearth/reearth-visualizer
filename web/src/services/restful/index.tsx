import { useAuth } from "@reearth/services/auth";
import { e2eAccessToken } from "@reearth/services/config";
import axios, { AxiosInstance } from "axios";
import { createContext, FC, ReactNode, useContext, useMemo } from "react";

type RestfulContextType = {
  axios: AxiosInstance;
};

const RestfulContext = createContext<RestfulContextType | undefined>(undefined);

export const RestfulProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const { getAccessToken } = useAuth();
    const endpoint = window.REEARTH_CONFIG?.api || "/";
  
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: endpoint
    });

    // Add Authorization header before every request
    instance.interceptors.request.use(async (config) => {
      const token = e2eAccessToken() || (await getAccessToken());
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [endpoint, getAccessToken]);

  return (
    <RestfulContext.Provider value={{ axios: axiosInstance }}>
      {children}
    </RestfulContext.Provider>
  );
};

export function useRestful() {
  const context = useContext(RestfulContext);
  if (!context) {
    throw new Error("useRestful must be used within a RestfulProvider");
  }
  return context;
}
