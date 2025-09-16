import { useQuery } from "@apollo/client";
import { GET_USER_BY_SEARCH } from "@reearth/services/gql/queries/user";
import { useMemo } from "react";

export const useSearchUser = (
  nameOrEmail: string,
  options?: { skip?: boolean }
) => {
  const { data, loading } = useQuery(GET_USER_BY_SEARCH, {
    variables: { nameOrEmail },
    skip: options?.skip
  });

  const user = useMemo(() => data?.searchUser, [data]);

  return { loading, user };
};
