import { type CognitoParams } from "./aws";

import { config } from ".";

export type AuthInfo = {
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
  authProvider?: string;
  cognito?: CognitoParams;
};

export function getAuthInfo(conf = config()): AuthInfo | undefined {
  return getMultitenantAuthInfo(conf) || defaultAuthInfo(conf);
}

export function defaultAuthInfo(conf = config()): AuthInfo | undefined {
  if (!conf) return;
  return {
    auth0Audience: conf.auth0Audience,
    auth0ClientId: conf.auth0ClientId,
    auth0Domain: conf.auth0Domain,
    authProvider: conf.authProvider || "auth0",
    cognito: conf.cognito,
  };
}

export function getMultitenantAuthInfo(conf = config()): AuthInfo | undefined {
  if (!conf?.multitenant) return;
  const name = getTenantName();
  if (name) {
    const tenant = conf.multitenant[name];
    if (tenant && !tenant.authProvider) {
      tenant.authProvider = "auth0";
    }
    return tenant;
  }
  return;
}

export function getTenantName(): string | undefined {
  const path = window.location.pathname;
  if (path.startsWith("/auth/")) {
    // e.g. /auth/tennant-name?code=xxx&state=xxx
    const name = path.split("/")[2];
    return name;
  }
  return;
}

export function getSignInCallbackUrl() {
  const tenantName = getTenantName();
  if (tenantName) {
    // multi-tenant
    return `${window.location.origin}/auth/${tenantName}`;
  }
  return window.location.origin;
}
