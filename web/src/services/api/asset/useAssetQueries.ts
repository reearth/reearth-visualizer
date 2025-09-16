import { useQuery } from "@apollo/client";
import { GetAssetsQueryVariables } from "@reearth/services/gql";
import { GET_ASSETS } from "@reearth/services/gql/queries/asset";
import { useMemo } from "react";

import { AssetNodes } from "./types";

export const useAssets = (input: GetAssetsQueryVariables) => {
  const { data, loading, networkStatus, fetchMore, ...rest } = useQuery(
    GET_ASSETS,
    {
      variables: input,
      skip: !input.workspaceId
    }
  );

  const assets = useMemo(
    () => data?.assets.edges?.map((e) => e.node) as AssetNodes,
    [data?.assets]
  );

  const hasMoreAssets = useMemo(
    () =>
      data?.assets.pageInfo?.hasNextPage ||
      data?.assets.pageInfo?.hasPreviousPage,
    [data?.assets]
  );
  const isRefetching = useMemo(() => networkStatus < 7, [networkStatus]);
  const endCursor = useMemo(
    () => data?.assets.pageInfo?.endCursor,
    [data?.assets]
  );

  return {
    assets,
    hasMoreAssets,
    isRefetching,
    endCursor,
    loading,
    fetchMore,
    ...rest
  };
};
