import { withAuthenticationRequired } from "@auth0/auth0-react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { ReactNode } from "react";

import { config } from "../config";

import { useAuthenticationRequired } from "./useAuth";

export { AuthProvider } from "./authProvider";
export { useAuth, useCleanUrl, useAuthenticationRequired } from "./useAuth";

const AuthenticationRequiredPage: React.FC<{ children?: ReactNode }> = ({
  children
}) => {
  const [isAuthenticated] = useAuthenticationRequired();
  return isAuthenticated && children ? <>{children}</> : null;
};

export const AuthenticatedPage: React.FC<{ children?: ReactNode }> = ({
  children
}) => {
  const authProvider = config()?.authProvider;

  if (authProvider === "cognito") {
    const WrappedComponent = withAuthenticator(AuthenticationRequiredPage);
    return <WrappedComponent>{children}</WrappedComponent>;
  } else if (authProvider === "auth0") {
    const WrappedComponent = withAuthenticationRequired(
      AuthenticationRequiredPage
    );
    return <WrappedComponent>{children}</WrappedComponent>;
  }

  return <AuthenticationRequiredPage>{children}</AuthenticationRequiredPage>;
};
