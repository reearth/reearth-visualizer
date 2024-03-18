import axios from "axios";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useGetTeamsQuery } from "@reearth/classic/gql";
import { useAuth, useCleanUrl } from "@reearth/services/auth";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, useNotification, useUserId } from "@reearth/services/state";

export type Mode = "layer" | "widget";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();
  const [error, isErrorChecked] = useCleanUrl();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [currentUserId, setCurrentUserId] = useUserId();
  const [, setNotification] = useNotification();

  const { data, loading } = useGetTeamsQuery({ skip: !isAuthenticated });

  if (isAuthenticated && !currentUserId) {
    setCurrentUserId(data?.me?.id);
  }

  const workspaceId = currentWorkspace?.id || data?.me?.myTeam?.id;

  const verifySignup = useCallback(
    async (token: string) => {
      const res = await axios.post(
        (window.REEARTH_CONFIG?.api || "/api") + "/signup/verify/" + token,
      );

      if (res.status === 200) {
        setNotification({
          type: "success",
          text: t("Your account has been successfully verified! Feel free to login now."),
        });
        navigate("/login");
      } else {
        setNotification({
          type: "error",
          text: t("Could not verify your signup. Please start the process over."),
        });
        navigate("/signup");
      }
    },
    [t, navigate, setNotification],
  );

  useEffect(() => {
    if (!isErrorChecked || error) return;

    if (window.location.search) {
      const searchParam = new URLSearchParams(window.location.search).toString().split("=");
      if (searchParam[0] === "user-verification-token") {
        verifySignup(searchParam[1]);
      } else if (searchParam[0] === "pwd-reset-token") {
        navigate(`/password-reset/?token=${searchParam[1]}`);
      }
    } else if (!isAuthenticated && !isLoading) {
      login();
    } else {
      if (!data?.me) return;
      setCurrentUserId(data?.me?.id);
      setCurrentWorkspace(data.me?.myTeam ?? undefined);
      navigate(`/dashboard${workspaceId ? "/" + workspaceId : ""}`);
    }
  }, [
    isAuthenticated,
    isLoading,
    currentWorkspace,
    data,
    isErrorChecked,
    error,
    workspaceId,
    login,
    verifySignup,
    navigate,
    setCurrentUserId,
    setCurrentWorkspace,
  ]);

  useEffect(() => {
    if (isErrorChecked && (authError || (isAuthenticated && !loading && data?.me === null))) {
      logout();
    }
  }, [authError, data?.me, isAuthenticated, isErrorChecked, loading, logout]);

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        text: error,
      });
    }
  }, [error, setNotification]);

  return {
    error,
    isLoading,
    isAuthenticated,
  };
};
