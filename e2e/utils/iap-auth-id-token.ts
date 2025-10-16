import { Browser, BrowserContext } from '@playwright/test';

import { DEFAULT_USER_AGENT } from './iap-auth-common';

export async function createIdTokenIAPContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Proxy-Authorization': `Bearer ${process.env.IAP_ID_TOKEN}`,
      'User-Agent': DEFAULT_USER_AGENT,
    },
    recordVideo: { dir: 'videos/', size: { width: 1280, height: 720 } },
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    permissions: ['geolocation'],
  });

  return context;
}
