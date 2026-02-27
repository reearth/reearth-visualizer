import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { reportError } from "@reearth/sentry";
import { GQLError } from "@reearth/services/state/gqlErrorHandling";

import { HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION } from "../..";

export default (setErrors: (errors: GQLError[]) => void) => {
  return new ErrorLink(({ error, operation }) => {
    const skipGlobalError =
      operation.getContext()?.headers?.[
        HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION
      ];

    let errors: GQLError[] = [];

    if (CombinedGraphQLErrors.is(error)) {
      errors = error.errors.map((gqlError) => ({
        type: gqlError.path?.[0]?.toString(),
        message: gqlError.message,
        code: gqlError.extensions?.code as string,
        description: gqlError.extensions?.description as string
      }));
    } else if (error) {
      errors = [
        { message: error.message, description: error.message }
      ];
    }

    if (errors.length > 0) {
      reportError(errors);
      if (!skipGlobalError) setErrors(errors);
    }
  });
};
