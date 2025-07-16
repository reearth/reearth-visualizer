import { withAuthenticationRequired } from "@auth0/auth0-react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import Welcome from "@reearth/ee/features/Welcome";
import { ReactNode } from "react";

import { config } from "../config";
import { appFeature } from "../config/appFeatureConfig";

import { useAuthenticationRequired } from "./useAuth";

export { AuthProvider } from "./authProvider";
export { useAuth, useCleanUrl, useAuthenticationRequired } from "./useAuth";

const AuthenticationRequiredPage: React.FC<{ children?: ReactNode }> = ({
  children
}) => {
  const [isAuthenticated] = useAuthenticationRequired();
  const authProvider = config()?.authProvider;
  const { externalAuth0Signup } = appFeature();
  return isAuthenticated && children ? (
    <>{children}</>
  ) : authProvider === "auth0" && externalAuth0Signup ? (
    <Welcome />
  ) : null;
};

export const AuthenticatedPage: React.FC<{ children?: ReactNode }> = ({
  children
}) => {
  const authProvider = config()?.authProvider;
  const { externalAuth0Signup } = appFeature();

  if (authProvider === "cognito") {
    const WrappedComponent = withAuthenticator(AuthenticationRequiredPage);
    return <WrappedComponent>{children}</WrappedComponent>;
  } else if (authProvider === "auth0" && !externalAuth0Signup) {
    const WrappedComponent = withAuthenticationRequired(
      AuthenticationRequiredPage
    );
    return <WrappedComponent>{children}</WrappedComponent>;
  }

  return <AuthenticationRequiredPage>{children}</AuthenticationRequiredPage>;
};
