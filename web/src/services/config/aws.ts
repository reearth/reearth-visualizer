import { Amplify } from "aws-amplify";

import { Config } from ".";

export type CognitoParams = {
  region?: string;
  userPoolId?: string;
  userPoolWebClientId?: string;
  oauthScope?: string;
  oauthDomain?: string;
  oauthRedirectSignIn?: string;
  oauthRedirectSignOut?: string;
  oauthResponseType?: string;
};

export const configureCognito = (config: Config) => {
  const cognitoConfig = config.cognito;
  const authProvider = config.authProvider;

  if (cognitoConfig && authProvider === "cognito") {
    const cognitoRegion = cognitoConfig?.region;
    const cognitoUserPoolId = cognitoConfig?.userPoolId;
    const cognitoUserPoolWebClientId = cognitoConfig?.userPoolWebClientId;
    const cognitoOauthScope = cognitoConfig?.oauthScope?.split(", ");
    const cognitoOauthDomain = cognitoConfig?.oauthDomain;
    const cognitoOauthRedirectSignIn = cognitoConfig?.oauthRedirectSignIn;
    const cognitoOauthRedirectSignOut = cognitoConfig?.oauthRedirectSignOut;
    const cognitoOauthResponseType = cognitoConfig?.oauthResponseType;

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
};
