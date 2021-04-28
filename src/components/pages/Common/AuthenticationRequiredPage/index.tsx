import React, { FC } from "react";

import useHooks from "./hooks";

const AuthenticationRequiredPage: FC = ({ children }) => {
  const [isAuthenticated, _error] = useHooks(); // TODO: show _error

  return isAuthenticated && children ? <>{children}</> : null;
};

export default AuthenticationRequiredPage;
