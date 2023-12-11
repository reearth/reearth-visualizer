import { useApolloClient } from "@apollo/client";
import { useCallback, useState, useRef, useMemo, useEffect } from "react";

import { Asset, SortType } from "@reearth/beta/features/Assets/types";
import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useAssetsFetcher } from "@reearth/services/api";
import { Maybe, AssetSortType as GQLSortType } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

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
}: {
  workspaceId?: string;
  onAssetSelect?: (inputValue?: string) => void;
}) => {
  const client = useApolloClient();

  const [sort, setSort] = useState<{ type?: SortType; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  const isGettingMore = useRef(false);

  const { useAssetsQuery, useRemoveAssets } = useAssetsFetcher();

  const { assets, hasMoreAssets, loading, isRefetching, endCursor, fetchMore } = useAssetsQuery({
    teamId: workspaceId ?? "",
    pagination: pagination(sort),
    sort: toGQLEnum(sort?.type),
    keyword: searchTerm,
  });

  useEffect(() => {
    return () => {
      client.cache.evict({ fieldName: "assets" });
      client.cache.gc();
    };
  }, [client.cache]);

  const t = useT();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm ?? "");
  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);
  const assetsWrapperRef = useRef<HTMLDivElement>(null);
  const sortOptions: { key: string; label: string }[] = useMemo(
    () => [
      { key: "date", label: t("Last Uploaded") },
      { key: "date-reverse", label: t("First Uploaded") },
      { key: "name", label: t("A To Z") },
      { key: "name-reverse", label: t("Z To A") },
      { key: "size", label: t("Size Small to Large") },
      { key: "size-reverse", label: t("Size Large to Small") },
    ],
    [t],
  );

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

  const handleRemove = useCallback(async () => {
    if (selectedAssets?.length) {
      const { status } = await useRemoveAssets(selectedAssets.map(a => a.id));
      if (status === "success") {
        selectAsset([]);
      }
      setDeleteModalVisible(false);
    }
  }, [selectedAssets, useRemoveAssets]);

  const handleReverse = useCallback(() => {
    handleSortChange?.(undefined, !sort?.reverse);
  }, [handleSortChange, sort?.reverse]);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
    },
    [setLocalSearchTerm],
  );
  const handleSearch = useCallback(() => {
    if (!localSearchTerm || localSearchTerm.length < 1) {
      handleSearchTerm?.(undefined);
    } else {
      handleSearchTerm?.(localSearchTerm);
    }
  }, [localSearchTerm, handleSearchTerm]);

  const isAssetsLoading = useMemo(() => {
    return loading ?? isRefetching;
  }, [isRefetching, loading]);

  useEffect(() => {
    if (assetsWrapperRef.current && !isAssetsLoading && hasMoreAssets)
      autoFillPage(assetsWrapperRef, handleGetMoreAssets);
  }, [handleGetMoreAssets, hasMoreAssets, isAssetsLoading]);

  const handleSelectAsset = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      selectAsset(!selectedAssets.includes(asset) ? [asset] : []);
    },
    [selectedAssets, selectAsset],
  );

  return {
    assets,
    assetsWrapperRef,
    isAssetsLoading,
    hasMoreAssets,
    sortOptions,
    sort,
    searchTerm,
    localSearchTerm,
    selectedAssets,
    deleteModalVisible,
    onScrollToBottom,
    closeDeleteModal,
    selectAsset,
    handleGetMoreAssets,
    handleSortChange,
    handleSearchTerm,
    handleSelectAsset,
    openDeleteModal,
    handleRemove,
    handleReverse,
    handleSearchInputChange,
    handleSearch,
  };
};
