import { useCallback, useState, useRef } from "react";

import { useAssetsFetcher } from "@reearth/services/api";
import { Maybe, AssetSortType as GQLSortType } from "@reearth/services/gql";

export type AssetSortType = "date" | "name" | "size";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

const assetsPerPage = 20;

const enumTypeMapper: Partial<Record<GQLSortType, string>> = {
  [GQLSortType.Date]: "date",
  [GQLSortType.Name]: "name",
  [GQLSortType.Size]: "size",
};

function toGQLEnum(val?: AssetSortType) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as GQLSortType[]).find(k => enumTypeMapper[k] === val);
}

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

export default ({ workspaceId }: { workspaceId?: string }) => {
  const [sort, setSort] = useState<{ type?: AssetSortType; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);
  const isGettingMore = useRef(false);

  const { useAssetsQuery, useCreateAssets, useRemoveAssets } = useAssetsFetcher();

  const { assets, hasMoreAssets, loading, isRefetching, endCursor, fetchMore } = useAssetsQuery({
    teamId: workspaceId ?? "",
    pagination: pagination(sort),
    sort: toGQLEnum(sort?.type),
    keyword: searchTerm,
  });

  const handleGetMoreAssets = useCallback(async () => {
    if (hasMoreAssets && !isGettingMore.current) {
      isGettingMore.current = true;
      await fetchMore({
        variables: {
          pagination: pagination(sort, endCursor),
        },
      });
      isGettingMore.current = false;
    }
  }, [endCursor, sort, fetchMore, hasMoreAssets, isGettingMore]);

  const createAssets = useCallback(
    (files: FileList) => {
      if (!files) return;
      useCreateAssets({ teamId: workspaceId ?? "", file: files });
    },
    [workspaceId, useCreateAssets],
  );

  const removeAssets = useCallback(
    async (assetIds: string[]) => {
      const { status } = await useRemoveAssets(assetIds);
      if (status === "success") {
        selectAsset([]);
      }
    },
    [useRemoveAssets],
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

  return {
    assets,
    isLoading: loading ?? isRefetching,
    hasMoreAssets,
    sort,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    createAssets,
    removeAssets,
    handleSortChange,
    handleSearchTerm,
  };
};
