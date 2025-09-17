import { useQuery } from "@apollo/client";
import { GET_ME } from "@reearth/services/gql/queries/user";

export const useMe = (options?: { skip?: boolean }) => {
  const { data, ...rest } = useQuery(GET_ME, { ...options });
  return {
    me: { ...data?.me },
    ...rest
  };
};
