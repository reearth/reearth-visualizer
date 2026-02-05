import { useAuth } from "@reearth/services/auth/useAuth";
import axios from "axios";
import { FC, ReactNode, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { useAddApiTask, useRemoveApiTask } from "../state";

import RestfulContext from "./context";

export const RestfulProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const { getAccessToken } = useAuth();
  const endpoint = window.REEARTH_CONFIG?.api || "/";

  const addApiTask = useAddApiTask();
  const removeApiTask = useRemoveApiTask();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: endpoint
    });

    instance.interceptors.request.use(
      async (config) => {
        const token = await getAccessToken();
        if (token && config.headers) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        const id = uuidv4();
        config.headers["X-Request-ID"] = id;
        addApiTask({
          id
        });

        return config;
      },
      (error) => {
        // Handle request error
        console.error("Request error:", error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => {
        const id = response.config.headers["X-Request-ID"];
        if (id) {
          removeApiTask({
            id
          });
        }
        return response;
      },
      (error) => {
        const id = error.config?.headers?.["X-Request-ID"];
        if (id) {
          removeApiTask({
            id
          });
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [endpoint, getAccessToken, addApiTask, removeApiTask]);

  return (
    <RestfulContext.Provider value={{ axios: axiosInstance }}>
      {children}
    </RestfulContext.Provider>
  );
};
