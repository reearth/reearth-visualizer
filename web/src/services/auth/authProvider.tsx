import { Auth0Provider } from "@auth0/auth0-react";
import {
  getAuthInfo,
  getSignInCallbackUrl,
  logInToTenant
} from "@reearth/services/config";
import React, { ReactNode, useState } from "react";

import { useAuth0Auth } from "./auth0Auth";
import { useCognitoAuth } from "./cognitoAuth";
import { AuthContext } from "./context";
import { useMockAuth } from "./mockAuth";

const Auth0Wrapper = ({ children }: { children: ReactNode }) => {
  const auth = useAuth0Auth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const CognitoWrapper = ({ children }: { children: ReactNode }) => {
  const auth = useCognitoAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const MockWrapper = ({ children }: { children: ReactNode }) => {
  const mockAuth = useMockAuth();
  return (
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children?: ReactNode }> = ({
  children
}) => {
  const [authInfo] = useState(() => {
    logInToTenant();
    return getAuthInfo();
  });

  if (authInfo?.authProvider === "mock") {
    return <MockWrapper>{children}</MockWrapper>;
  }

  if (authInfo?.authProvider === "auth0") {
    const domain = authInfo.auth0Domain;
    const clientId = authInfo.auth0ClientId;
    const audience = authInfo.auth0Audience;

    return domain && clientId ? (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          audience: audience,
          scope: "openid profile email offline_access",
          redirect_uri: getSignInCallbackUrl()
        }}
        useRefreshTokens
        useRefreshTokensFallback
        cacheLocation="localstorage"
      >
        <Auth0Wrapper>{children}</Auth0Wrapper>
      </Auth0Provider>
    ) : null;
  }

  if (authInfo?.authProvider === "cognito") {
    return <CognitoWrapper>{children}</CognitoWrapper>;
  }

  return null;
};
