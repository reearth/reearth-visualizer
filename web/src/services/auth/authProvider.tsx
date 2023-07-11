import { Auth0Provider } from "@auth0/auth0-react";
import React, { createContext, ReactNode, Fragment } from "react";

import type { AuthHook } from "./authHook";
import { useAuth0Auth } from "./authOAuth";
import { useCognitoAuth } from "./cognitoAuth";

export const AuthContext = createContext<AuthHook | null>(null);

const Auth0Wrapper = ({ children }: { children: ReactNode }) => {
  const auth = useAuth0Auth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const CognitoWrapper = ({ children }: { children: ReactNode }) => {
  const auth = useCognitoAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const authProvider = window.REEARTH_CONFIG?.authProvider;

  if (authProvider === "auth0") {
    const domain = window.REEARTH_CONFIG?.auth0Domain;
    const clientId = window.REEARTH_CONFIG?.auth0ClientId;
    const audience = window.REEARTH_CONFIG?.auth0Audience;

    return domain && clientId ? (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          audience: audience,
          scope: "openid profile email offline_access",
          redirect_uri: window.location.origin,
        }}
        useRefreshTokens
        useRefreshTokensFallback
        cacheLocation="localstorage">
        <Auth0Wrapper>{children}</Auth0Wrapper>
      </Auth0Provider>
    ) : null;
  }

  if (authProvider === "cognito") {
    // No specific provider needed for Cognito/AWS Amplify
    return <CognitoWrapper>{children}</CognitoWrapper>;
  }

  return <Fragment>{children}</Fragment>; // or some default fallback
};
