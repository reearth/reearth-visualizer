import { withAuthenticationRequired } from "@auth0/auth0-react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { ReactNode } from "react";

import { useAuthenticationRequired } from "./useAuth";

export { AuthProvider } from "./authProvider";
export { useAuth, useCleanUrl, useAuthenticationRequired } from "./useAuth";

const AuthenticationRequiredPage: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [isAuthenticated] = useAuthenticationRequired(); // TODO: show error
  return isAuthenticated && children ? <>{children}</> : null;
};

const withAuthorisation = (): ((props: any) => React.FC<any>) => {
  const authProvider = window.REEARTH_CONFIG?.authProvider;
  if (authProvider === "cognito") {
    return withAuthenticator as unknown as (props: any) => React.FC<any>;
  } else if (authProvider === "auth0") {
    return withAuthenticationRequired as unknown as (props: any) => React.FC<any>;
  }
  return (props: any) => props;
};

export const AuthenticatedPage = withAuthorisation()(AuthenticationRequiredPage);
