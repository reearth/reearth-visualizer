import axios from "axios";

import { config } from "./config";

export async function login(): Promise<string> {
  const { authUrl, userName, password, authAudience, authClientId } = config;

  if (!authUrl || !userName || !password || !authAudience || !authClientId) {
    throw new Error(
      `either authUrl, userName, password, authAudience and authClientId are missing: ${JSON.stringify(
        {
          authUrl,
          userName,
          password: password ? "***" : "",
          authAudience,
          authClientId,
        },
      )}`,
    );
  }

  try {
    const resp = await axios.post<{ access_token?: string }>(
      `${oauthDomain(authUrl)}/oauth/token`,
      {
        username: userName,
        password,
        audience: authAudience,
        client_id: authClientId,
        grant_type: "password",
        scope: "openid profile email",
      },
    );

    if (!resp.data.access_token) {
      throw new Error("access token is missing");
    }
    return resp.data.access_token;
  } catch (e) {
    throw new Error(
      `${e}, config=${JSON.stringify({
        authUrl,
        userName,
        password: password ? "***" : "",
        authAudience,
        authClientId,
      })}`,
    );
  }
}

function oauthDomain(u: string | undefined): string {
  if (!u) return "";
  if (!u.startsWith("https://") && !u.startsWith("http://")) {
    u = "https://" + u;
  }
  return u.endsWith("/") ? u.slice(0, -1) : u;
}
