import { getAccessToken, setAccessToken } from "./config";
import { login } from "./login";

export default async function globalSetup() {
  if (!getAccessToken()) {
    setAccessToken(await login());
  }
}
