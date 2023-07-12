import { setContext } from "@apollo/client/link/context";

import { useAuth } from "@reearth/services/auth";
import { e2eAccessToken } from "@reearth/services/config";

export default () => {
  const { getAccessToken } = useAuth();

  return setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const accessToken = e2eAccessToken() || (await getAccessToken());
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });
};
