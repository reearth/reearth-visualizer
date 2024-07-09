import axios from "axios";
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGetTeamsQuery } from "@reearth/beta/graphql";
import { useAuth, useCleanUrl } from "@reearth/services/auth";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, useNotification, useUserId } from "@reearth/services/state";

// TODO: move hooks to molecules (page components should be thin)
export default () => {
  const { isAuthenticated, isLoading, error: authError, logout, login } = useAuth();
  const [error] = useCleanUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const [currentUserId, setCurrentUserId] = useUserId();
  const [, setNotification] = useNotification();
  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;
  const t = useT();

  const { data, loading } = useGetTeamsQuery({ skip: !isAuthenticated });

  if (isAuthenticated && !currentUserId) {
    setCurrentUserId(data?.me?.id);
  }

  const workspaceId = currentWorkspace?.id || data?.me?.myTeam?.id;

  useEffect(() => {
    if (location.pathname === "/login" && !new URLSearchParams(window.location.search).has("id"))
      login();
  }, [login, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || currentWorkspace || !data || !workspaceId) return;
    setCurrentUserId(data?.me?.id);
    setCurrentWorkspace(data.me?.myTeam ?? undefined);
  }, [
    isAuthenticated,
    navigate,
    data,
    workspaceId,
    currentWorkspace,
    setCurrentUserId,
    setCurrentWorkspace,
  ]);

  useEffect(() => {
    if (authError || (isAuthenticated && !loading && data?.me === null)) {
      logout();
    }
  }, [authError, data?.me, isAuthenticated, loading, logout]);

  useEffect(() => {
    const loginError = new URL(document.location.toString()).searchParams.get("error");

    if (loginError != null && loginError.length != 0) {
      setNotification({
        type: "error",
        text: loginError.toString(),
      });

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("error");
      if (history.replaceState) {
        const searchString =
          searchParams.toString().length > 0 ? "?" + searchParams.toString() : "";
        const newUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          window.location.pathname +
          searchString +
          window.location.hash;
        history.replaceState(null, "", newUrl);
      }
    }
  }, [setNotification]);

  if (error) {
    setNotification({
      type: "error",
      text: error,
    });
  }

  const handleSignup = useCallback(
    async ({
      email,
      username,
      password,
    }: {
      email: string;
      username: string;
      password: string;
    }) => {
      if (isAuthenticated) return;

      try {
        const res = await axios.post((window.REEARTH_CONFIG?.api || "/api") + "/signup", {
          email,
          username,
          password,
        });

        if (res.status !== 200) {
          throw res;
        }
      } catch (err: any) {
        setNotification({
          type: "error",
          text:
            err?.response?.data?.error ||
            err?.data?.error ||
            t("Some error has occurred. Please wait a moment and try again."),
        });
        throw err;
      }
    },
    [isAuthenticated, setNotification, t],
  );

  const handlePasswordResetRequest = useCallback(
    async (email?: string) => {
      if (isAuthenticated || !email) return;
      const res = await axios.post((window.REEARTH_CONFIG?.api || "/api") + "/password-reset", {
        email,
      });
      if (res.status !== 200) {
        setNotification({
          type: "error",
          text: res.data.error,
        });
        return res;
      } else {
        setNotification({
          type: "success",
          text: res.data.message,
        });
        return res;
      }
    },
    [isAuthenticated, setNotification],
  );

  const handleNewPasswordSubmit = useCallback(
    async (newPassword?: string, email?: string, token?: string) => {
      if (isAuthenticated || !newPassword || !email || !token) return;
      const res = await axios.post((window.REEARTH_CONFIG?.api || "/api") + "/password-reset", {
        email,
        password: newPassword,
        token,
      });
      if (res.status === 200) {
        setNotification({
          type: "success",
          text: res.data.message,
        });
        navigate("/login");
      } else {
        setNotification({
          type: "error",
          text: res.data.error,
        });
      }
    },
    [isAuthenticated, setNotification, navigate],
  );

  return {
    isLoading,
    isAuthenticated,
    passwordPolicy,
    handleSignup,
    handlePasswordResetRequest,
    handleNewPasswordSubmit,
  };
};
