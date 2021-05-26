import React from "react";
import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";
import { useAuth0 } from "@auth0/auth0-react";

import { store, localSlice } from "@reearth/state";
import fragmentMatcher from "./fragmentMatcher.json";

const Provider: React.FC = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();

  const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessTokenSilently());
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  const uploadLink = createUploadLink({
    uri: window.REEARTH_CONFIG?.api,
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (!networkError && !graphQLErrors) return;
    const error = networkError?.message ?? graphQLErrors?.map(e => e.message).join(", ");
    store.dispatch(localSlice.actions.set({ error }));
  });

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
    },
  });

  const client = new ApolloClient({
    uri: window.REEARTH_CONFIG?.api ? `${window.REEARTH_CONFIG.api}/graphql` : "/api/graphql",
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    cache,
    connectToDevTools: process.env.NODE_ENV === "development",
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
