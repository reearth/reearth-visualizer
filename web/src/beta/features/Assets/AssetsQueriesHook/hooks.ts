import { useCallback, useState, useRef, useEffect } from "react";
import useFileInput from "use-file-input";

import { Asset, SortType } from "@reearth/beta/features/Assets/types";
import { autoFillPage } from "@reearth/beta/utils/infinite-scroll";
import { useAssetsFetcher } from "@reearth/services/api";
import { Maybe, AssetSortType as GQLSortType } from "@reearth/services/gql";

import { FILE_FORMATS, IMAGE_FORMATS } from "../constants";

const assetsPerPage = 20;

const enumTypeMapper: Partial<Record<GQLSortType, string>> = {
  [GQLSortType.Date]: "date",
  [GQLSortType.Name]: "name",
  [GQLSortType.Size]: "size",
};

function toGQLEnum(val?: SortType) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as GQLSortType[]).find(k => enumTypeMapper[k] === val);
}

function pagination(
  sort?: { type?: Maybe<SortType>; reverse?: boolean },
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

export default ({
  workspaceId,
  onAssetSelect,
}: {
  workspaceId?: string;
  onAssetSelect?: (inputValue?: string) => void;
}) => {
  const [sort, setSort] = useState<{ type?: SortType; reverse?: boolean }>();
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

  const handleAssetsCreate = useCallback(
    async (files?: FileList) => {
      if (!files) return;
      const result = await useCreateAssets({ teamId: workspaceId ?? "", file: files });
      const assetUrl = result?.data[0].data?.createAsset?.asset.url;

      onAssetSelect?.(assetUrl);
    },
    [workspaceId, useCreateAssets, onAssetSelect],
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
        type: (type as SortType) ?? sort?.type,
        reverse: !!reverse,
      });
    },
    [sort],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  const handleFileSelect = useFileInput(files => handleAssetsCreate?.(files), {
    accept: IMAGE_FORMATS + "," + FILE_FORMATS,
    multiple: true,
  });

  const handleSelectAsset = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      selectAsset(!selectedAssets.includes(asset) ? [asset] : []);
    },
    [selectedAssets, selectAsset],
  );

  const isAssetsLoading = loading ?? isRefetching;

  const assetsWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assetsWrapperRef.current && !isAssetsLoading && hasMoreAssets)
      autoFillPage(assetsWrapperRef, handleGetMoreAssets);
  }, [handleGetMoreAssets, hasMoreAssets, isAssetsLoading]);

  return {
    assets,
    assetsWrapperRef,
    isAssetsLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    handleFileSelect,
    removeAssets,
    handleSortChange,
    handleSearchTerm,
    handleSelectAsset,
  };
};
