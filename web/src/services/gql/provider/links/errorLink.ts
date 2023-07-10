import { onError } from "@apollo/client/link/error";

import { reportError } from "@reearth/sentry";
import { useSetError } from "@reearth/services/state";

export default () => {
  const { setError } = useSetError();

  return onError(({ graphQLErrors, networkError }) => {
    if (!networkError && !graphQLErrors) return;
    let error: { type?: string; message?: string } | undefined;

    if (networkError?.message) {
      error = { message: networkError?.message };
    } else {
      error = {
        type: graphQLErrors?.[0].path?.[0].toString(),
        message: graphQLErrors?.[0].message,
      };
    }
    if (error) {
      setError(error);
      reportError(error);
    }
  });
};
