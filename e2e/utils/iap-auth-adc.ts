import { Browser, BrowserContext } from '@playwright/test';
import { GoogleAuth } from 'google-auth-library';

import { createIAPBrowserContext } from './iap-auth-common';

export type ADCIAPConfig = {
  targetAudience: string;
}

type CachedToken = {
  token: string;
  expiresAt: number;
};

export class ADCIAPAuthHelper {
  private readonly audience: string;
  private readonly adc: GoogleAuth;
  private cache?: CachedToken;

  constructor(config: ADCIAPConfig) {
    this.audience = config.targetAudience.trim();
    this.adc = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  }

  async getIdToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.token;
    }

    const token = await this.tokenFromADC();
    this.cache = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
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

  static fromEnv(): ADCIAPAuthHelper {
    const targetAudience = process.env.IAP_TARGET_AUDIENCE;

    if (!targetAudience) {
      throw new Error('IAP_TARGET_AUDIENCE environment variable is required');
    }

    return new ADCIAPAuthHelper({ targetAudience });
  }

  private async tokenFromADC(): Promise<string> {
    const client = await this.adc.getIdTokenClient(this.audience);
    const rawHeaders = await client.getRequestHeaders() as unknown;
    let headerValue: string | null | undefined;

    if (rawHeaders && typeof (rawHeaders as { get?: unknown }).get === 'function') {
      const headerBag = rawHeaders as { get(name: string): string | null };
      headerValue = headerBag.get('Authorization') ?? headerBag.get('authorization');
    } else {
      const headerRecord = rawHeaders as Record<string, string | undefined>;
      headerValue = headerRecord?.Authorization ?? headerRecord?.authorization ?? null;
    }

    if (!headerValue) {
      throw new Error('Authorization header is missing from ADC response. Make sure you are authenticated with Google Cloud (try: gcloud auth application-default login)');
    }

    const token = headerValue.replace(/^[Bb]earer\s+/, '').trim();

    if (!token) {
      throw new Error('Empty token received from ADC response. Please try: gcloud auth application-default login');
    }

    return token;
  }
}

export const getADCIAPToken = async (): Promise<string> => {
  return ADCIAPAuthHelper.fromEnv().getIdToken();
};

export const makeADCIAPRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return ADCIAPAuthHelper.fromEnv().makeAuthenticatedRequest(url, options);
};

export async function createADCIAPContext(
  browser: Browser,
  baseUrl: string,
  options?: { storageState?: string },
): Promise<BrowserContext> {
  const targetAudience = process.env.IAP_TARGET_AUDIENCE;

  if (!targetAudience) {
    throw new Error('IAP_TARGET_AUDIENCE environment variable is required for ADC authentication');
  }

  const helper = new ADCIAPAuthHelper({ targetAudience });
  return createIAPBrowserContext(browser, baseUrl, helper, options);
}
