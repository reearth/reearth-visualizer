import { ApolloClient, InMemoryCache, NormalizedCacheObject, createHttpLink } from "@apollo/client";

import fragmentMatcher from "../base/catalog/__gen__/fragmentMatcher.json";

export let catalogClient: ApolloClient<NormalizedCacheObject> | undefined;
export const createCatalogClient = (url: string, token?: string) => {
  const httpLink = createHttpLink({
    uri: url,
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });

  catalogClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
      possibleTypes: fragmentMatcher.possibleTypes,
    }),
  });
};
