import { OperationVariables } from "@apollo/client";
import { GraphQLFormattedError } from "graphql/index";

export type QueryReturn<T> = {
  data?: T | null | undefined;
} & OperationVariables;

export type MutationReturn<T> = {
  data?: T | null | undefined;
  status: "success" | "error";
  errors?: ReadonlyArray<GraphQLFormattedError>;
};
