import { useQuery } from "@apollo/client";
import { useCallback } from "react";

import { GET_ME } from "@reearth/services/gql/queries/user";

export default () => {
  const useMeQuery = useCallback((options?: { skip?: boolean }) => {
    const { data, ...rest } = useQuery(GET_ME, { ...options });
    return {
      me: { ...data?.me },
      ...rest,
    };
  }, []);

  return {
    useMeQuery,
  };
};
