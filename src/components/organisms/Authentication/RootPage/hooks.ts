import axios from "axios";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useGetTeamsQuery } from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useTeam, useNotification, useUserId } from "@reearth/state";

export type Mode = "layer" | "widget";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();
  const [error, isErrorChecked] = useCleanUrl();
  const [currentWorkspace, setWorkspace] = useTeam();
  const [currentUserId, setCurrentUserId] = useUserId();
  const [, setNotification] = useNotification();

  const { data, loading } = useGetTeamsQuery({ skip: !isAuthenticated });

  if (isAuthenticated && !currentUserId) {
    setCurrentUserId(data?.me?.id);
  }

  const workspaceId = useMemo(() => {
    return currentWorkspace?.id || data?.me?.myTeam.id;
  }, [currentWorkspace?.id, data?.me?.myTeam.id]);

  const handleRedirect = useCallback(() => {
    if (currentUserId === data?.me?.id) {
      setWorkspace(
        workspaceId
          ? data?.me?.teams.find(t => t.id === workspaceId) ?? data?.me?.myTeam
          : undefined,
      );
      navigate(`/dashboard/${workspaceId}`);
    } else {
      setCurrentUserId(data?.me?.id);
      setWorkspace(data?.me?.myTeam);
      navigate(`/dashboard/${data?.me?.myTeam.id}`);
    }
  }, [
    currentUserId,
    data?.me?.id,
    data?.me?.teams,
    data?.me?.myTeam,
    setWorkspace,
    workspaceId,
    navigate,
    setCurrentUserId,
  ]);

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
      if (!data || !workspaceId) return;
      handleRedirect();
    }
  }, [
    isAuthenticated,
    login,
    isLoading,
    verifySignup,
    navigate,
    currentWorkspace,
    handleRedirect,
    data,
    isErrorChecked,
    error,
    workspaceId,
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
