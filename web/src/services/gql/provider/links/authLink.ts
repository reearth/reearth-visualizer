import { setContext } from "@apollo/client/link/context";

export default (getAccessToken: () => Promise<string | null>) => {
  return setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const accessToken = await getAccessToken();
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    };
  });
};
