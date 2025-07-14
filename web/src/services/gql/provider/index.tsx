import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  InMemoryCache
} from "@apollo/client";
import {
  GQLTask,
  useAddApiTask,
  useRemoveApiTask
} from "@reearth/services/state";
import { useCallback, type ReactNode } from "react";

import fragmentMatcher from "../__gen__/fragmentMatcher.json";

import { authLink, sentryLink, errorLink, uploadLink, taskLink } from "./links";
import langLink from "./links/langLink";
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
              "workspaceId",
              "projectId",
              "keyword",
              "sort",
              "pagination",
              ["first", "last"]
            ],
            merge: paginationMerge
          },
          projects: {
            keyArgs: [
              "workspaceId",
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

  const addApiTask = useAddApiTask();
  const removeApiTask = useRemoveApiTask();

  const addTask = useCallback(
    (task: GQLTask) => {
      requestAnimationFrame(() => {
        addApiTask(task);
      });
    },
    [addApiTask]
  );

  const removeTask = useCallback(
    (task: GQLTask) => {
      requestAnimationFrame(() => {
        removeApiTask(task);
      });
    },
    [removeApiTask]
  );

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([
      taskLink(addTask, removeTask),
      errorLink(),
      sentryLink(endpoint),
      authLink(),
      langLink(),
      // https://github.com/apollographql/apollo-client/issues/6011#issuecomment-619468320
      uploadLink(endpoint) as unknown as ApolloLink
    ]),
    cache,
    connectToDevTools: import.meta.env.DEV
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
