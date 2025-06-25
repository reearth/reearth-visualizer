import useLoadMore from "@reearth/app/hooks/useLoadMore";
import { ManagerLayout } from "@reearth/app/ui/components/ManagerBase";
import { useAssetsFetcher } from "@reearth/services/api";
import { AssetSortField, SortDirection } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useFileInput from "use-file-input";

import {
  AcceptedAssetsTypes,
  FileType,
  GENERAL_FILE_TYPE_ACCEPT_STRING,
  GIS_FILE_TYPES,
  IMAGE_FILE_TYPES,
  MODEL_FILE_TYPES
} from "./constants";
import { Asset, sortOptionValue, SortType } from "./types";

const ASSETS_PER_PAGE = 20;

const typeToGQLField = {
  date: AssetSortField.Date,
  name: AssetSortField.Name,
  size: AssetSortField.Size
};

export default ({
  workspaceId,
  projectId,
  allowMultipleSelection,
  assetsTypes,
  layout,
  additionalFilter,
  onSelectChange,
  onLayoutChange
}: {
  workspaceId?: string;
  projectId?: string;
  allowMultipleSelection: boolean;
  assetsTypes?: AcceptedAssetsTypes;
  layout?: ManagerLayout;
  additionalFilter?: (asset: Asset) => boolean;
  onSelectChange?: (assets: Asset[]) => void;
  onLayoutChange?: (layout: ManagerLayout) => void;
}) => {
  // sort
  const [sort, setSort] = useState<{ type?: SortType; reverse?: boolean }>({
    type: "date",
    reverse: true
  });
  const t = useT();

  const sortValue = useMemo(() => {
    if (!sort) return undefined;
    switch (sort.type) {
      case "date":
        return sort.reverse ? "date" : "date-reverse";
      case "name":
        return sort.reverse ? "name-reverse" : "name";
      case "size":
        return sort.reverse ? "size-reverse" : "size";
      default:
        return undefined;
    }
  }, [sort]);

  const sortOptions: { value: sortOptionValue; label: string }[] = useMemo(
    () => [
      { value: "date", label: t("Last Uploaded") },
      { value: "date-reverse", label: t("First Uploaded") },
      { value: "name", label: t("A To Z") },
      { value: "name-reverse", label: t("Z To A") },
      { value: "size", label: t("Size Small to Large") },
      { value: "size-reverse", label: t("Size Large to Small") }
    ],
    [t]
  );

  const handleSortChange = useCallback((value: string) => {
    switch (value) {
      case "date":
        setSort({ type: "date", reverse: true });
        break;
      case "date-reverse":
        setSort({ type: "date", reverse: false });
        break;
      case "name":
        setSort({ type: "name", reverse: false });
        break;
      case "name-reverse":
        setSort({ type: "name", reverse: true });
        break;
      case "size":
        setSort({ type: "size", reverse: false });
        break;
      case "size-reverse":
        setSort({ type: "size", reverse: true });
        break;
    }
  }, []);

  // search
  const [searchTerm, setSearchTerm] = useState<string>();

  const handleSearch = useCallback((searchTerm?: string) => {
    setSearchTerm(searchTerm);
  }, []);

  // assets
  const { useAssetsQuery, useRemoveAssets, useCreateAssets } =
    useAssetsFetcher();
  const { assets, hasMoreAssets, isRefetching, endCursor, loading, fetchMore } =
    useAssetsQuery({
      teamId: workspaceId ?? "",
      projectId,
      pagination: {
        first: ASSETS_PER_PAGE
      },
      sort: {
        direction: sort.reverse ? SortDirection.Desc : SortDirection.Asc,
        field: typeToGQLField[sort.type ?? "date"]
      },
      keyword: searchTerm
    });

  const assetsExts = useMemo(
    () =>
      assetsTypes
        ?.map((t) =>
          t === "image"
            ? IMAGE_FILE_TYPES
            : t === "file"
              ? GIS_FILE_TYPES
              : t === "model"
                ? MODEL_FILE_TYPES
                : t
        )
        .flat(),
    [assetsTypes]
  );

  const filteredAssets = useMemo(() => {
    const assetsWithAdditionalFilter = additionalFilter
      ? assets?.filter(additionalFilter)
      : assets;
    if (!assetsExts || !assets) return assetsWithAdditionalFilter;
    return assetsWithAdditionalFilter.filter((a) =>
      assetsExts.includes(
        (a.url.split(".").pop()?.toLowerCase() as FileType) ?? ""
      )
    );
  }, [assets, assetsExts, additionalFilter]);

  // get more assets
  const isLoadingMoreRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMore = useCallback(async () => {
    if (!hasMoreAssets || isRefetching || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    await fetchMore({
      variables: {
        pagination: {
          first: ASSETS_PER_PAGE,
          after: endCursor
        }
      }
    });
    setLoadingMore(false);
    isLoadingMoreRef.current = false;
  }, [hasMoreAssets, isRefetching, fetchMore, endCursor]);

  const { wrapperRef: assetsWrapperRef, contentRef: assetsContentRef } =
    useLoadMore({
      data: filteredAssets,
      onLoadMore: loadMore
    });

  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const parentElement = assetsWrapperRef.current;
    const childElement = assetsContentRef.current;

    if (!parentElement || !childElement) return;

    const checkSize = () => {
      if (childElement && parentElement) {
        setContentWidth(childElement.offsetWidth);
      }
    };

    const parentObserver = new ResizeObserver(checkSize);
    const childObserver = new ResizeObserver(checkSize);

    parentObserver.observe(parentElement);
    childObserver.observe(childElement);

    checkSize();

    return () => {
      parentObserver.disconnect();
      childObserver.disconnect();
    };
  }, [filteredAssets, assetsWrapperRef, assetsContentRef]);

  const handleAssetsCreate = useCallback(
    async (files?: FileList) => {
      if (!files) return;
      await useCreateAssets({
        teamId: workspaceId ?? "",
        projectId,
        file: files,
        coreSupport: true
      });
    },
    [useCreateAssets, workspaceId, projectId]
  );

  // upload
  // currently use in dashboard only therefore we can set multiple to true always
  const handleAssetUpload = useFileInput(
    (files) => handleAssetsCreate?.(files),
    {
      accept: GENERAL_FILE_TYPE_ACCEPT_STRING,
      multiple: true
    }
  );

  // layout
  const [localLayout, setLocalLayout] = useState(layout ?? "grid");
  const handleLayoutChange = useCallback(
    (newLayout?: ManagerLayout) => {
      if (!newLayout) return;
      setLocalLayout(newLayout);
      onLayoutChange?.(newLayout);
      assetsWrapperRef.current?.scrollTo({ top: 0 });
    },
    [assetsWrapperRef, onLayoutChange]
  );
  useEffect(() => {
    if (!layout) return;
    setLocalLayout((prev) => (prev !== layout ? layout : prev));
  }, [layout]);

  // path
  // TODO: support path with folder
  // const [paths, _setPaths] = useState<BreadcrumbItem[]>([
  //   { id: "assets", title: t("Assets") }
  // ]);
  // const handlePathClick = useCallback((_id?: string) => {}, []);

  // select
  const [selectedAssetIds, selectAsset] = useState<string[]>([]);
  const ctrlPressed = useRef(false);

  const handleAssetSelect = useCallback(
    (assetId: string | undefined) => {
      if (allowMultipleSelection && ctrlPressed.current && assetId) {
        selectAsset(
          selectedAssetIds.includes(assetId)
            ? selectedAssetIds.filter((a) => a !== assetId)
            : [...selectedAssetIds, assetId]
        );
      } else {
        selectAsset(assetId ? [assetId] : []);
      }
    },
    [selectedAssetIds, allowMultipleSelection]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        ctrlPressed.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        ctrlPressed.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!onSelectChange) return;
    onSelectChange(
      selectedAssetIds
        .map((id) => assets.find((a) => a.id === id))
        .filter((a) => !!a) as Asset[]
    );
  }, [selectedAssetIds, assets, onSelectChange]);

  const handleAssetDelete = useCallback(async () => {
    if (selectedAssetIds.length) {
      const { status } = await useRemoveAssets(selectedAssetIds);
      if (status === "success") {
        selectAsset([]);
      }
    }
  }, [selectedAssetIds, useRemoveAssets]);

  return {
    filteredAssets,
    sortValue,
    sortOptions,
    handleSortChange,
    localLayout,
    handleLayoutChange,
    selectedAssetIds,
    handleAssetSelect,
    handleAssetDelete,
    assetsWrapperRef,
    assetsContentRef,
    handleSearch,
    handleAssetUpload,
    contentWidth,
    loading,
    loadingMore
  };
};
