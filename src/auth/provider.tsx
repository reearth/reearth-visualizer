import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

const Provider: React.FC = ({ children }) => {
  const domain = window.REEARTH_CONFIG?.auth0Domain;
  const clientId = window.REEARTH_CONFIG?.auth0ClientId;

  return domain && clientId ? (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      scope="openid profile email"
      useRefreshTokens={true}
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
