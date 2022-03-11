import { useNavigate } from "@reach/router";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useTeamsQuery } from "@reearth/gql";
import { useTeam, useNotification } from "@reearth/state";

export type Mode = "layer" | "widget";

export default () => {
  const intl = useIntl();
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();
  const error = useCleanUrl();
  const navigate = useNavigate();
  const [currentTeam, setTeam] = useTeam();
  const [, setNotification] = useNotification();

  const { data, loading } = useTeamsQuery({ skip: !isAuthenticated });
  const teamId = currentTeam?.id || data?.me?.myTeam.id;

  const verifySignup = useCallback(
    async (token: string) => {
      const res = await axios.post(
        (window.REEARTH_CONFIG?.api || "/api") + "/signup/verify/" + token,
      );
      if (res.status === 200) {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage: "Your account has been successfully verified! Feel free to login now.",
          }),
        });
        navigate("/login");
      } else {
        setNotification({
          type: "error",
          text: intl.formatMessage({
            defaultMessage: "Could not verify your signup. Please start the process over.",
          }),
        });
        navigate("/signup");
      }
    },
    [intl, navigate, setNotification],
  );

  useEffect(() => {
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
      if (currentTeam || !data || !teamId) return;
      setTeam(data.me?.myTeam);
      navigate(`/dashboard/${teamId}`);
    }
  }, [
    isAuthenticated,
    login,
    isLoading,
    verifySignup,
    navigate,
    currentTeam,
    setTeam,
    data,
    teamId,
  ]);

  useEffect(() => {
    if (authError || (isAuthenticated && !loading && data?.me === null)) {
      logout();
    }
  }, [authError, data?.me, isAuthenticated, loading, logout]);

  if (error) {
    setNotification({
      type: "error",
      text: error,
    });
  }

  return {
    isLoading,
    isAuthenticated,
  };
};
