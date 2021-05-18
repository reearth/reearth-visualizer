import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

const Provider: React.FC = ({ children }) => {
  const domain = window.REEARTH_CONFIG?.auth0Domain;
  const clientId = window.REEARTH_CONFIG?.auth0ClientId;
  const audience = window.REEARTH_CONFIG?.auth0Audience;

  return domain && clientId && audience ? (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      audience={audience}
      useRefreshTokens
      scope="openid profile email"
      cacheLocation="localstorage"
      redirectUri={window.location.origin}>
      {children}
    </Auth0Provider>
  ) : (
    // TODO
    <>{children}</>
  );
};

export default Provider;
