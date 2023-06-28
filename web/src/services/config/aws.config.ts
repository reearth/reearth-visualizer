import { Amplify } from "aws-amplify";

const authProvider = window.REEARTH_CONFIG?.authProvider;
if (authProvider === "cognito") {
  const cognitoRegion = window.REEARTH_CONFIG?.cognitoRegion;
  const cognitoUserPoolId = window.REEARTH_CONFIG?.cognitoUserPoolId;
  const cognitoUserPoolWebClientId = window.REEARTH_CONFIG?.cognitoUserPoolWebClientId;
  const cognitoOauthScope = window.REEARTH_CONFIG?.cognitoOauthScope?.split(", ");
  const cognitoOauthDomain = window.REEARTH_CONFIG?.cognitoOauthDomain;
  const cognitoOauthRedirectSignIn = window.REEARTH_CONFIG?.cognitoOauthRedirectSignIn;
  const cognitoOauthRedirectSignOut = window.REEARTH_CONFIG?.cognitoOauthRedirectSignOut;
  const cognitoOauthResponseType = window.REEARTH_CONFIG?.cognitoOauthResponseType;

  const config = {
    Auth: {
      region: cognitoRegion,
      userPoolId: cognitoUserPoolId,
      userPoolWebClientId: cognitoUserPoolWebClientId,
      oauth: {
        scope: cognitoOauthScope,
        domain: cognitoOauthDomain,
        redirectSignIn: cognitoOauthRedirectSignIn,
        redirectSignOut: cognitoOauthRedirectSignOut,
        responseType: cognitoOauthResponseType,
      },
    },
  };

  Amplify.configure(config);
}
