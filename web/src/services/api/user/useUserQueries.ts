import { useQuery } from "@apollo/client/react";
import { GET_USER_BY_SEARCH } from "@reearth/services/gql/queries/user";
import { useMemo } from "react";

export const useSearchUser = (alias: string, options?: { skip?: boolean }) => {
  const { data, loading } = useQuery(GET_USER_BY_SEARCH, {
    variables: { alias },
    skip: options?.skip
  });

  const user = useMemo(() => data?.searchUser, [data]);

  return { loading, user };
};
