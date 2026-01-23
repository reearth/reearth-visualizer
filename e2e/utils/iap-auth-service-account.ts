import { Browser, BrowserContext } from '@playwright/test';
import { JWT } from 'google-auth-library';

import { createIAPBrowserContext } from './iap-auth-common';

const TOKEN_CACHE_DURATION_MS = 55 * 60 * 1000; // 55 minutes

export type ServiceAccountIAPConfig = {
  targetAudience: string;
  serviceAccountJson: string;
}

export type ServiceAccountCredentials = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

type CachedToken = {
  token: string;
  expiresAt: number;
};

export class ServiceAccountIAPAuthHelper {
  private readonly audience: string;
  private readonly credentials: ServiceAccountCredentials;
  private cache?: CachedToken;

  constructor(config: ServiceAccountIAPConfig) {
    this.audience = config.targetAudience.trim();
    this.credentials = JSON.parse(config.serviceAccountJson) as ServiceAccountCredentials;
  }

  async getIdToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.token;
    }

    const token = await this.tokenFromServiceAccount();
    this.cache = { token, expiresAt: Date.now() + TOKEN_CACHE_DURATION_MS };
    return token;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    const token = await this.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);

    return fetch(url, { ...options, headers });
  }

  async forceRefresh(): Promise<void> {
    this.cache = undefined;
  }

  static fromEnv(): ServiceAccountIAPAuthHelper {
    const targetAudience = process.env.IAP_TARGET_AUDIENCE;
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!targetAudience) {
      throw new Error('IAP_TARGET_AUDIENCE environment variable is required');
    }

    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required for Service Account authentication');
    }

    return new ServiceAccountIAPAuthHelper({ targetAudience, serviceAccountJson });
  }

  private async tokenFromServiceAccount(): Promise<string> {
    const client = new JWT({
      email: this.credentials.client_email,
      key: this.credentials.private_key,
      additionalClaims: { target_audience: this.audience }
    });

    const token = await client.fetchIdToken(this.audience);
    if (!token) {
      throw new Error('Unable to fetch IAP ID token using service account credentials');
    }

    return token;
  }
}

export const getServiceAccountIAPToken = async (): Promise<string> => {
  return ServiceAccountIAPAuthHelper.fromEnv().getIdToken();
};

export const makeServiceAccountIAPRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return ServiceAccountIAPAuthHelper.fromEnv().makeAuthenticatedRequest(url, options);
};

export async function createServiceAccountIAPContext(
  browser: Browser,
  baseUrl: string,
  options?: { storageState?: string },
): Promise<BrowserContext> {
  const targetAudience = process.env.IAP_TARGET_AUDIENCE;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!targetAudience || !serviceAccountJson) {
    throw new Error('Service Account IAP configuration is missing - IAP_TARGET_AUDIENCE and GOOGLE_SERVICE_ACCOUNT_JSON are required');
  }

  const helper = new ServiceAccountIAPAuthHelper({
    targetAudience,
    serviceAccountJson
  });

  return createIAPBrowserContext(browser, baseUrl, helper, options);
}
