import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  InMemoryCache
} from "@apollo/client";
import type { ReactNode } from "react";

import fragmentMatcher from "../__gen__/fragmentMatcher.json";

import { authLink, sentryLink, errorLink, uploadLink } from "./links";
import { paginationMerge } from "./pagination";

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";

  const cache = new InMemoryCache({
    possibleTypes: fragmentMatcher.possibleTypes,
    typePolicies: {
      LayerGroup: {
        fields: {
          layers: {
            merge: false
          }
        }
      },
      Query: {
        fields: {
          assets: {
            keyArgs: [
              "teamId",
              "keyword",
              "sort",
              "pagination",
              ["first", "last"]
            ],
            merge: paginationMerge
          },
          projects: {
            keyArgs: [
              "teamId",
              "keyword",
              "sort",
              "pagination",
              ["first", "last"]
            ],
            merge: paginationMerge
          },
          datasetSchemas: {
            keyArgs: ["sceneId", "first", "after"],
            merge: paginationMerge
          }
        }
      }
    }
  });

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([
      errorLink(),
      sentryLink(endpoint),
      authLink(),
      // https://github.com/apollographql/apollo-client/issues/6011#issuecomment-619468320
      uploadLink(endpoint) as unknown as ApolloLink
    ]),
    cache,
    connectToDevTools: import.meta.env.DEV
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
