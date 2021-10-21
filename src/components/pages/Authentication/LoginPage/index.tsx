import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import Login from "@reearth/components/organisms/Authentication/Login";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const LoginPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, onLogin } = useHooks();

  return isLoading ? <Loading /> : !isAuthenticated ? <Login onLogin={onLogin} /> : null;
};

export default LoginPage;
