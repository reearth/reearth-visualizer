import { onError } from "@apollo/client/link/error";
import { reportError } from "@reearth/sentry";
import { useSetError } from "@reearth/services/state";
import { GQLError } from "@reearth/services/state/gqlErrorHandling";

import { HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION } from "../..";

export default () => {
  const { setErrors } = useSetError();

  return onError(({ graphQLErrors, networkError, operation }) => {
    const skipGlobalError =
      operation.getContext()?.headers?.[HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION];

    if (!networkError && !graphQLErrors) return;

    let errors: GQLError[] = [];

    if (networkError?.message) {
      errors = [
        { message: networkError.message, description: networkError.message }
      ];
    } else {
      errors =
        graphQLErrors?.map((gqlError) => ({
          type: gqlError.path?.[0]?.toString(),
          message: gqlError.message,
          code: gqlError.extensions?.code as string,
          description: gqlError.extensions?.description as string
        })) ?? [];
    }

    if (errors.length > 0) {
      reportError(errors);
      if (skipGlobalError) return;
      setErrors(errors);
    }
  });
};
