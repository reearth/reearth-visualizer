import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

import fragmentMatcher from "../base/catalog/__gen__/fragmentMatcher.json";

let _catalogClient: ApolloClient | undefined;

export const getCatalogClient = (): ApolloClient | undefined => _catalogClient;

export const createCatalogClient = (url: string, token?: string) => {
  const httpLink = createHttpLink({
    uri: url,
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });

  _catalogClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache({
      possibleTypes: fragmentMatcher.possibleTypes,
    }),
  });
};

// Deprecated: use getCatalogClient() instead
export { _catalogClient as catalogClient };
