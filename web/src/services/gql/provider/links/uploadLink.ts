import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

type RequestInitWithTimeout = RequestInit & { __timeout?: number };

export default (
  endpoint: string,
  onLatestLogoutAt?: (timestamp: number) => void
) => {
  return new UploadHttpLink({
    uri: endpoint,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const timeout = (init as RequestInitWithTimeout)?.__timeout ?? 30000;
      return fetchWithTimeout(input, init, Number(timeout), onLatestLogoutAt);
    }
  });
};

const fetchWithTimeout = (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeout = 30000,
  onLatestLogoutAt?: (timestamp: number) => void
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(input, {
    ...init,
    signal: controller.signal
  })
    .then((response) => {
      if (onLatestLogoutAt) {
        const logoutAt = response.headers.get("X-Latest-Logout-At");
        if (logoutAt) {
          const timestamp = parseInt(logoutAt, 10);
          if (!isNaN(timestamp)) {
            onLatestLogoutAt(timestamp);
          }
        }
      }
      return response;
    })
    .finally(() => clearTimeout(timer));
};
