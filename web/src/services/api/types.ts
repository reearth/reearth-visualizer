import type { ErrorLike, OperationVariables } from "@apollo/client";

export type QueryReturn<T> = {
  data?: T | null | undefined;
} & OperationVariables;

export type MutationReturn<T> = {
  data?: T | null | undefined;
  status: "success" | "error";
  error?: ErrorLike;
};

export type CustomOptions = {
  skip?: boolean;
};
