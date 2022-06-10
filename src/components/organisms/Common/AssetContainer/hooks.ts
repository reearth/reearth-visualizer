import { useApolloClient } from "@apollo/client";
import { useCallback, useState, useEffect } from "react";

import {
  GetAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
  useGetAssetsQuery,
  Maybe,
  AssetSortType as GQLSortType,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useNotification } from "@reearth/state";

export type AssetNodes = NonNullable<GetAssetsQuery["assets"]["nodes"][number]>[];

export type AssetSortType = "date" | "name" | "size";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

const enumTypeMapper: Partial<Record<GQLSortType, string>> = {
  [GQLSortType.Date]: "date",
  [GQLSortType.Name]: "name",
  [GQLSortType.Size]: "size",
};

function toGQLEnum(val?: AssetSortType) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as GQLSortType[]).find(k => enumTypeMapper[k] === val);
}

const assetsPerPage = 20;

function pagination(
  sort?: { type?: Maybe<AssetSortType>; reverse?: boolean },
  endCursor?: string | null,
) {
  const reverseOrder = !sort?.type || sort?.type === "date" ? !sort?.reverse : !!sort?.reverse;

  return {
    after: !reverseOrder ? endCursor : undefined,
    before: reverseOrder ? endCursor : undefined,
    first: !reverseOrder ? assetsPerPage : undefined,
    last: reverseOrder ? assetsPerPage : undefined,
  };
}

export default (teamId?: string, initialAssetUrl?: string | null, allowDeletion?: boolean) => {
  const t = useT();
  const [, setNotification] = useNotification();
  const [sort, setSort] = useState<{ type?: AssetSortType; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const gqlCache = useApolloClient().cache;

  const { data, refetch, loading, fetchMore, networkStatus } = useGetAssetsQuery({
    variables: {
      teamId: teamId ?? "",
      pagination: pagination(sort),
      sort: toGQLEnum(sort?.type),
      keyword: searchTerm,
    },
    notifyOnNetworkStatusChange: true,
    skip: !teamId,
  });

  const hasMoreAssets =
    data?.assets.pageInfo?.hasNextPage || data?.assets.pageInfo?.hasPreviousPage;

  const isRefetching = networkStatus === 3;
  const assets = data?.assets.edges?.map(e => e.node) as AssetNodes;

  const initialAsset = assets?.find(a => a.url === initialAssetUrl);
  const [selectedAssets, selectAsset] = useState<Asset[]>(initialAsset ? [initialAsset] : []);

  const handleGetMoreAssets = useCallback(() => {
    if (hasMoreAssets) {
      fetchMore({
        variables: {
          pagination: pagination(sort, data?.assets.pageInfo.endCursor),
        },
      });
    }
  }, [data?.assets.pageInfo, sort, fetchMore, hasMoreAssets]);

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (!teamId) return;

        const results = await Promise.all(
          Array.from(files).map(async file => {
            const result = await createAssetMutation({ variables: { teamId, file } });
            if (result.errors || !result.data?.createAsset) {
              setNotification({
                type: "error",
                text: t("Failed to add one or more assets."),
              });
            }
          }),
        );
        if (results) {
          setNotification({
            type: "success",
            text: t("Successfully added one or more assets."),
          });
          await refetch();
        }
      })(),
    [createAssetMutation, setNotification, refetch, teamId, t],
  );

  const [removeAssetMutation] = useRemoveAssetMutation();
  const removeAssets = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (!teamId) return;
        const results = await Promise.all(
          assetIds.map(async assetId => {
            const result = await removeAssetMutation({
              variables: { assetId },
              refetchQueries: ["GetAssets"],
            });
            if (result.errors || result.data?.removeAsset) {
              setNotification({
                type: "error",
                text: t("Failed to delete one or more assets."),
              });
            }
          }),
        );
        if (results) {
          setNotification({
            type: "info",
            text: t("One or more assets were successfully deleted."),
          });
          selectAsset([]);
        }
      })(),
    [removeAssetMutation, teamId, setNotification, t],
  );

  const handleSortChange = useCallback(
    (type?: string, reverse?: boolean) => {
      if (!type && reverse === undefined) return;
      setSort({
        type: (type as AssetSortType) ?? sort?.type,
        reverse: !!reverse,
      });
    },
    [sort],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (sort || searchTerm) {
      selectAsset([]);
      refetch({
        sort: toGQLEnum(sort?.type),
        keyword: searchTerm,
      });
    }
  }, [sort, searchTerm, refetch]);

  useEffect(() => {
    return () => {
      setSort(undefined);
      setSearchTerm(undefined);
      gqlCache.evict({ fieldName: "assets" });
    };
  }, [gqlCache]);

  return {
    assets,
    initialAsset,
    isLoading: loading ?? isRefetching,
    hasMoreAssets,
    sort,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    createAssets,
    removeAssets: allowDeletion ? removeAssets : undefined,
    handleSortChange,
    handleSearchTerm,
  };
};
