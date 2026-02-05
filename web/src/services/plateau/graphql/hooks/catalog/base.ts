import {
  DocumentNode,
  TypedDocumentNode,
  OperationVariables,
  ApolloClient
} from "@apollo/client";
import {
  useQuery as useApolloQuery,
  useLazyQuery as useApolloLazyQuery,
  QueryHookOptions,
  LazyQueryHookOptions
} from "@apollo/client/react";

import { getCatalogClient } from "../../clients";

type CatalogQueryOptions<TVariables extends OperationVariables> = {
  skip?: boolean;
  variables?: TVariables;
};

export const useQuery = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: CatalogQueryOptions<TVariables>
) => {
  const client = getCatalogClient();
  return useApolloQuery<TData, TVariables>(query, {
    ...options,
    client: client as ApolloClient,
    skip: options?.skip || !client
  } as QueryHookOptions<TData, TVariables>);
};

export const useLazyQuery = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: CatalogQueryOptions<TVariables>
) => {
  const client = getCatalogClient();
  return useApolloLazyQuery<TData, TVariables>(query, {
    ...options,
    client: client as ApolloClient
  } as LazyQueryHookOptions<TData, TVariables>);
};
