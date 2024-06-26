import React from "react";

import Loading from "@reearth/classic/components/atoms/Loading";
import PasswordReset from "@reearth/classic/components/organisms/Authentication/PasswordReset";

import useHooks from "../hooks";

export type Props = {
  path?: string;
};

const PasswordResetPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, handlePasswordResetRequest, handleNewPasswordSubmit } =
    useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <PasswordReset
      onPasswordResetRequest={handlePasswordResetRequest}
      onNewPasswordSubmit={handleNewPasswordSubmit}
    />
  ) : null;
};

export default PasswordResetPage;
