// @ts-expect-error - apollo-upload-client/createUploadLink.mjs doesn't have type definitions
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

type RequestInitWithTimeout = RequestInit & { __timeout?: number };

export default (endpoint: string) => {
  return createUploadLink({
    uri: endpoint,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const timeout = (init as RequestInitWithTimeout)?.__timeout ?? 30000;
      return fetchWithTimeout(input, init, Number(timeout));
    }
  });
};

const fetchWithTimeout = (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeout = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(input, {
    ...init,
    signal: controller.signal
  }).finally(() => clearTimeout(timer));
};
