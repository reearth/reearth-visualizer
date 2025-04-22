import { ApolloError } from "@apollo/client";

import { GQLError } from "../state/gqlErrorHandling";

export const handleGqlError = (error?: ApolloError) => {
  if (!error?.networkError && !error?.graphQLErrors) return;
  let errors: GQLError[] = [];

  if (error.networkError?.message) {
    errors = [
      {
        message: error.networkError?.message,
        description: error.networkError.message
      }
    ];
  } else {
    errors =
      error.graphQLErrors?.map((gqlError) => {
        return {
          type: gqlError.path?.[0].toString(),
          message: gqlError.message,
          code: gqlError.extensions?.code as string,
          description: gqlError.extensions?.description as string
        };
      }) ?? [];
  }
  return errors;
};
