import { onError } from "@apollo/client/link/error";
import { reportError } from "@reearth/sentry";
import { useSetError } from "@reearth/services/state";
import { GQLError } from "@reearth/services/state/gqlErrorHandling";

export default () => {
  const { setErrors } = useSetError();

  return onError(({ graphQLErrors, networkError }) => {
    if (!networkError && !graphQLErrors) return;
    let errors: GQLError[] = [];

    if (networkError?.message) {
      errors = [
        { message: networkError?.message, description: networkError.message }
      ];
    } else {
      errors =
        graphQLErrors?.map((gqlError) => {
          return {
            type: gqlError.path?.[0].toString(),
            message: gqlError.message,
            code: gqlError.extensions?.code as string,
            description: gqlError.extensions?.description as string
          };
        }) ?? [];
    }
    if (errors.length > 0) {
      setErrors(errors);
      reportError(errors);
    }
  });
};
