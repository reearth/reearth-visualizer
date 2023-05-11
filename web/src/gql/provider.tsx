import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import type { ReadFieldFunction } from "@apollo/client/cache/core/types/common";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { SentryLink } from "apollo-link-sentry";
import { createUploadLink } from "apollo-upload-client";
import { isEqual } from "lodash-es";
import type { ReactNode } from "react";

import { useAuth } from "@reearth/auth";
import { e2eAccessToken } from "@reearth/config";
import { reportError } from "@reearth/sentry";
import { useError } from "@reearth/state";

import fragmentMatcher from "./fragmentMatcher.json";

function paginationMerge(
  existing: any,
  incoming: any,
  { readField }: { readField: ReadFieldFunction },
) {
  if (existing && incoming && isEqual(existing, incoming)) return incoming;

  const merged = existing ? existing.edges.slice(0) : [];

  let offset = offsetFromCursor(merged, existing?.pageInfo.endCursor, readField);
  if (offset < 0) offset = merged.length;

  for (let i = 0; i < incoming?.edges?.length; ++i) {
    merged[offset + i] = incoming.edges[i];
  }

  return {
    ...incoming,
    edges: merged,
  };
}

function offsetFromCursor(items: any, cursor: string, readField: ReadFieldFunction) {
  if (items.length < 1) return -1;
  for (let i = 0; i <= items.length; ++i) {
    const item = items[i];
    if (readField("cursor", item) === cursor) {
      return i + 1;
    }
  }
  return -1;
}

const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";
  const [, setError] = useError();
  const { getAccessToken } = useAuth();

  const authLink = setContext(async (_, { headers }) => {
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

  const uploadLink = createUploadLink({
    uri: endpoint,
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (!networkError && !graphQLErrors) return;
    let error: { type?: string; message?: string } | undefined;

    if (networkError?.message) {
      error = { message: networkError?.message };
    } else {
      error = {
        type: graphQLErrors?.[0].path?.[0].toString(),
        message: graphQLErrors?.[0].message,
      };
    }
    if (error) {
      setError(error);
      reportError(error);
    }
  });

  const sentryLink = new SentryLink({ uri: endpoint });

  const cache = new InMemoryCache({
    possibleTypes: fragmentMatcher.possibleTypes,
    typePolicies: {
      LayerGroup: {
        fields: {
          layers: {
            merge: false,
          },
        },
      },
      Query: {
        fields: {
          assets: {
            keyArgs: ["teamId", "keyword", "sort", "pagination", ["first", "last"]],
            merge: paginationMerge,
          },
          projects: {
            keyArgs: ["teamId", "last", "before"],
            merge: paginationMerge,
          },

          datasetSchemas: {
            keyArgs: ["sceneId", "first", "after"],
            merge: paginationMerge,
          },
        },
      },
    },
  });

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([errorLink, sentryLink, authLink, uploadLink]),
    cache,
    connectToDevTools: import.meta.env.DEV,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
