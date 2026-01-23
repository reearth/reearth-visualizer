import path from 'path';

import { Browser, BrowserContext } from '@playwright/test';

export const DEFAULT_USER_AGENT = 'Playwright-E2E-Tests';

const AUTH_WHITELIST_HOSTS = ['auth0.com', 'googleapis.com', 'accounts.google.com'];

export type IAPTokenProvider = {
  getIdToken(): Promise<string>;
  forceRefresh?(): Promise<void>;
}

export type IAPContextOptions = {
  storageState?: string;
}

function isAuthenticationError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('401') ||
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('access denied')
    );
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status?: number }).status === 401;
  }

  return false;
}

export async function createIAPBrowserContext(
  browser: Browser,
  baseUrl: string,
  provider: IAPTokenProvider,
  options?: IAPContextOptions,
): Promise<BrowserContext> {
  if (!baseUrl) {
    throw new Error('Missing baseUrl for IAP context');
  }

  const initialToken = await provider.getIdToken();

  if (!initialToken || initialToken.trim() === '') {
    throw new Error('Invalid IAP credentials: empty token received from provider');
  }

  // Resolve storage state path if provided
  const storageStatePath = options?.storageState
    ? path.isAbsolute(options.storageState)
      ? options.storageState
      : path.join(process.cwd(), options.storageState)
    : undefined;

  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Proxy-Authorization': `Bearer ${initialToken}`,
      'User-Agent': DEFAULT_USER_AGENT,
    },
    recordVideo: { dir: 'videos/', size: { width: 1280, height: 720 } },
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    permissions: ['geolocation'],
    storageState: storageStatePath,
  });


  const protectedHost = new URL(baseUrl).host;

  let isContextClosing = false;
  context.on('close', () => {
    isContextClosing = true;
  });

  await context.route('**', async (route, request) => {
    // Skip route handling if context is closing
    if (isContextClosing) {
      try {
        await route.abort('failed');
      } catch {
        // Ignore errors during abort if context is already closed
      }
      return;
    }

    let requestHost: string | undefined;
    const requestUrl = request.url();

    try {
      requestHost = new URL(requestUrl).host;
    } catch {
      requestHost = undefined;
    }

    const resourceType = request.resourceType();
    if (resourceType !== 'document' && resourceType !== 'xhr' && resourceType !== 'fetch') {
      await route.continue();
      return;
    }

    if (requestHost && AUTH_WHITELIST_HOSTS.some(host => requestHost?.includes(host))) {
      await route.continue();
      return;
    }

    if (requestHost !== protectedHost) {
      await route.continue();
      return;
    }

    const baseHeaders = request.headers();
    const headers = Object.fromEntries(
      Object.entries(baseHeaders).filter(([key]) =>
        key.toLowerCase() !== 'authorization' && key.toLowerCase() !== 'proxy-authorization'
      ),
    );

    try {
      const authToken = await provider.getIdToken();

      if (!authToken || authToken.trim() === '') {
        throw new Error('Invalid IAP credentials: empty token received during route interception');
      }

      headers['Proxy-Authorization'] = `Bearer ${authToken}`;

      const response = await context.request.fetch(request, { headers });
      await route.fulfill({ response });
    } catch (error) {
      // Check if context/browser is closed
      const isContextClosed = error instanceof Error &&
        (error.message.includes('context or browser has been closed') ||
         error.message.includes('Target closed') ||
         error.message.includes('Target page, context or browser has been closed'));

      if (isContextClosed) {
        // Don't log or retry if context is closing - just abort silently
        try {
          await route.abort('failed');
        } catch {
          // Ignore errors during abort if context is already closed
        }
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        'IAP route interception failed, continuing original request. URL:',
        requestUrl,
        'Error:',
        errorMessage,
      );

      if (isAuthenticationError(error) && provider.forceRefresh) {
        try {
          await provider.forceRefresh();
          const refreshedToken = await provider.getIdToken();

          if (!refreshedToken || refreshedToken.trim() === '') {
            throw new Error('Invalid IAP credentials: empty token received after refresh');
          }

          headers['Proxy-Authorization'] = `Bearer ${refreshedToken}`;

          const retryResponse = await context.request.fetch(request, { headers });
          await route.fulfill({ response: retryResponse });
          return;
        } catch (retryError) {
          const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Unknown retry error';
          console.warn('Token refresh retry also failed:', retryErrorMessage);
        }
      }

      await route.continue();
    }
  });

  return context;
}
