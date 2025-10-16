import path from 'path';

import { Browser, BrowserContext } from '@playwright/test';

import { DEFAULT_USER_AGENT } from './iap-auth-common';

export async function createIdTokenIAPContext(
  browser: Browser,
  options?: { storageState?: string },
): Promise<BrowserContext> {
  // Resolve storage state path if provided
  const storageStatePath = options?.storageState
    ? path.isAbsolute(options.storageState)
      ? options.storageState
      : path.join(process.cwd(), options.storageState)
    : undefined;

  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Proxy-Authorization': `Bearer ${process.env.IAP_ID_TOKEN}`,
      'User-Agent': DEFAULT_USER_AGENT,
    },
    recordVideo: { dir: 'videos/', size: { width: 1280, height: 720 } },
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    permissions: ['geolocation'],
    storageState: storageStatePath,
  });

  return context;
}
