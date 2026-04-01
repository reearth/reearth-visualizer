import { updateLatestLogoutAt } from "@reearth/services/auth/logoutTimestamp";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

type RequestInitWithTimeout = RequestInit & { __timeout?: number };

export default (endpoint: string) => {
  return new UploadHttpLink({
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
  })
    .then((response) => {
      const logoutAt = response.headers.get("X-Latest-Logout-At");
      if (logoutAt) {
        const timestamp = parseInt(logoutAt, 10);
        if (!isNaN(timestamp)) {
          updateLatestLogoutAt(timestamp);
        }
      }
      return response;
    })
    .finally(() => clearTimeout(timer));
};
