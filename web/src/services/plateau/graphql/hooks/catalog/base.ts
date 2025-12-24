import {
  useQuery as useApolloQuery,
  useLazyQuery as useApolloLazyQuery,
  DocumentNode,
  TypedDocumentNode,
  OperationVariables,
  QueryHookOptions,
  NoInfer,
  QueryResult,
  LazyQueryResultTuple,
} from "@apollo/client";

import { catalogClient } from "../../clients";

export const useQuery = <TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>,
): QueryResult<TData, TVariables> => {
  return useApolloQuery(query, {
    ...options,
    client: catalogClient,
  });
};

export const useLazyQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>,
): LazyQueryResultTuple<TData, TVariables> => {
  return useApolloLazyQuery(query, {
    ...options,
    client: catalogClient,
  });
};
