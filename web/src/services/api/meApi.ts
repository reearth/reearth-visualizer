import { useGetMeQuery } from "@reearth/services/gql";

export const useMeQuery = () => {
  const { data, ...rest } = useGetMeQuery();
  return {
    me: { ...data?.me },
    ...rest,
  };
};
