import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useFileInput from "use-file-input";

import { BreadcrumbItem } from "@reearth/beta/lib/reearth-ui";
import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import { useAssetsFetcher } from "@reearth/services/api";
import { AssetSortType, Maybe } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import {
  FileType,
  GENERAL_FILE_TYPE_ACCEPT_STRING,
  GIS_FILE_TYPES,
  IMAGE_FILE_TYPES,
} from "./constants";
import { Asset, sortOptionValue, SortType } from "./types";

const ASSETS_PER_PAGE = 20;
const ASSETS_LAYOUT_STORAGE_KEY = `reearth-visualizer-dashboard-assets-layout`;

export default ({
  workspaceId,
  allowMultipleSelection,
  assetsTypes,
  onSelectChange,
}: {
  workspaceId?: string;
  allowMultipleSelection: boolean;
  assetsTypes?: ("image" | "file" | FileType)[];
  onSelectChange?: (assets: Asset[]) => void;
}) => {
  // sort
  const [sort, setSort] = useState<{ type?: SortType; reverse?: boolean }>({
    type: "date",
    reverse: false,
  });
  const t = useT();

  const sortValue = useMemo(() => {
    if (!sort) return undefined;
    switch (sort.type) {
      case "date":
        return sort.reverse ? "date-reverse" : "date";
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
      { value: "size-reverse", label: t("Size Large to Small") },
    ],
    [t],
  );

  const handleSortChange = useCallback((value: string) => {
    switch (value) {
      case "date":
        setSort({ type: "date", reverse: false });
        break;
      case "date-reverse":
        setSort({ type: "date", reverse: true });
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
  const { useAssetsQuery, useRemoveAssets, useCreateAssets } = useAssetsFetcher();
  const { assets, hasMoreAssets, isRefetching, endCursor, fetchMore } = useAssetsQuery({
    teamId: workspaceId ?? "",
    pagination: pagination(sort),
    sort: toGQLEnum(sort?.type),
    keyword: searchTerm,
  });

  const assetsExts = useMemo(
    () =>
      assetsTypes
        ?.map(t => (t === "image" ? IMAGE_FILE_TYPES : t === "file" ? GIS_FILE_TYPES : t))
        .flat(),
    [assetsTypes],
  );

  const filteredAssets = useMemo(() => {
    if (!assetsExts || !assets) return assets;
    return assets.filter(a =>
      assetsExts.includes((a.url.split(".").pop()?.toLowerCase() as FileType) ?? ""),
    );
  }, [assets, assetsExts]);

  // get more assets
  const isLoadingMore = useRef(false);
  const loadMore = useCallback(() => {
    if (!hasMoreAssets || isRefetching || isLoadingMore.current) return;
    isLoadingMore.current = true;
    fetchMore({
      variables: {
        pagination: pagination(sort, endCursor),
      },
    });
  }, [hasMoreAssets, isRefetching, fetchMore, sort, endCursor]);

  const loadMoreRef = useRef<() => void>(loadMore);
  loadMoreRef.current = loadMore;

  const assetsWrapperRef = useRef<HTMLDivElement>(null);
  const assetsContentRef = useRef<HTMLDivElement>(null);

  const checkSize = useCallback(() => {
    const parentElement = assetsWrapperRef.current;
    const childElement = assetsContentRef.current;

    if (childElement && parentElement) {
      if (childElement.offsetHeight - 14 < parentElement.offsetHeight) {
        loadMoreRef.current?.();
      }
    }
  }, []);

  useEffect(() => {
    isLoadingMore.current = false;
    checkSize();
  }, [assets, checkSize]);

  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const parentElement = assetsWrapperRef.current;
    const childElement = assetsContentRef.current;

    if (!parentElement || !childElement) return;

    const checkSize = () => {
      if (childElement && parentElement) {
        if (childElement.offsetHeight <= parentElement.offsetHeight) {
          loadMoreRef.current?.();
        }
        setContentWidth(childElement.offsetWidth);
      }
    };

    const parentObserver = new ResizeObserver(checkSize);
    const childObserver = new ResizeObserver(checkSize);

    parentObserver.observe(parentElement);
    childObserver.observe(childElement);

    checkSize();

    const handleScroll = () => {
      if (childElement) {
        const isScrolledToBottom =
          childElement.scrollHeight - parentElement.scrollTop - parentElement.clientHeight < 50;
        if (isScrolledToBottom) {
          loadMoreRef.current?.();
        }
      }
    };

    parentElement.addEventListener("scroll", handleScroll);

    return () => {
      parentObserver.disconnect();
      childObserver.disconnect();
      parentElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAssetsCreate = useCallback(
    async (files?: FileList) => {
      if (!files) return;
      await useCreateAssets({
        teamId: workspaceId ?? "",
        file: files,
      });
    },
    [workspaceId, useCreateAssets],
  );

  // upload
  // currently use in dashboard only therefore we can set multiple to true always
  const handleAssetUpload = useFileInput(files => handleAssetsCreate?.(files), {
    accept: GENERAL_FILE_TYPE_ACCEPT_STRING,
    multiple: true,
  });

  // layout
  const [layout, setLayout] = useState(
    ["grid", "list"].includes(localStorage.getItem(ASSETS_LAYOUT_STORAGE_KEY) ?? "")
      ? (localStorage.getItem(ASSETS_LAYOUT_STORAGE_KEY) as ManagerLayout)
      : "grid",
  );
  const handleLayoutChange = useCallback((newLayout?: ManagerLayout) => {
    if (!newLayout) return;
    localStorage.setItem(ASSETS_LAYOUT_STORAGE_KEY, newLayout);
    setLayout(newLayout);
    assetsWrapperRef.current?.scrollTo({ top: 0 });
  }, []);

  // path
  // TODO: support path with folder
  const [paths, _setPaths] = useState<BreadcrumbItem[]>([{ id: "assets", title: "Assets" }]);
  const handlePathClick = useCallback((_id?: string) => {}, []);

  // select
  const [selectedAssetIds, selectAsset] = useState<string[]>([]);
  const ctrlPressed = useRef(false);

  const handleAssetSelect = useCallback(
    (assetId: string | undefined) => {
      if (allowMultipleSelection && ctrlPressed.current && assetId) {
        selectAsset(
          selectedAssetIds.includes(assetId)
            ? selectedAssetIds.filter(a => a !== assetId)
            : [...selectedAssetIds, assetId],
        );
      } else {
        selectAsset(assetId ? [assetId] : []);
      }
    },
    [selectedAssetIds, allowMultipleSelection],
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
      selectedAssetIds.map(id => assets.find(a => a.id === id)).filter(a => !!a) as Asset[],
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
    paths,
    handlePathClick,
    sortValue,
    sortOptions,
    handleSortChange,
    layout,
    handleLayoutChange,
    selectedAssetIds,
    handleAssetSelect,
    handleAssetDelete,
    assetsWrapperRef,
    assetsContentRef,
    handleSearch,
    handleAssetUpload,
    contentWidth,
  };
};

const enumTypeMapper: Partial<Record<AssetSortType, string>> = {
  [AssetSortType.Date]: "date",
  [AssetSortType.Name]: "name",
  [AssetSortType.Size]: "size",
};

function toGQLEnum(val?: SortType) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as AssetSortType[]).find(k => enumTypeMapper[k] === val);
}

function pagination(
  sort?: { type?: Maybe<SortType>; reverse?: boolean },
  endCursor?: string | null,
) {
  const reverseOrder = !sort?.type || sort?.type === "date" ? !sort?.reverse : !!sort?.reverse;

  return {
    after: !reverseOrder ? endCursor : undefined,
    before: reverseOrder ? endCursor : undefined,
    first: !reverseOrder ? ASSETS_PER_PAGE : undefined,
    last: reverseOrder ? ASSETS_PER_PAGE : undefined,
  };
}
