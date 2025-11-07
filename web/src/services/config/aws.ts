import { Amplify } from "aws-amplify";

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

export const configureCognito = (cognitoConfig: CognitoParams) => {
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
      Cognito: {
        region: cognitoRegion,
        userPoolId: cognitoUserPoolId || "",
        userPoolClientId: cognitoUserPoolWebClientId || "",
        loginWith: {
          oauth: {
            domain: cognitoOauthDomain || "",
            scopes: cognitoOauthScope || [],
            redirectSignIn: [cognitoOauthRedirectSignIn || ""],
            redirectSignOut: [cognitoOauthRedirectSignOut || ""],
            responseType:
              (cognitoOauthResponseType as "code" | "token" | undefined) ||
              "code"
          }
        }
      }
    }
  };

  Amplify.configure(config);
};
