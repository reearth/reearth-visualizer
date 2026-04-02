import { setContext } from "@apollo/client/link/context";

export default (getAccessToken: () => Promise<string | null>) => {
  return setContext(async (_, { headers }) => {
    const accessToken = await getAccessToken();
    return {
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    };
  });
};
