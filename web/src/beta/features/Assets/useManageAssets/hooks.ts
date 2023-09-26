import { useState, useCallback, useMemo, useRef, useEffect } from "react";

import { Asset, SortType } from "@reearth/beta/features/Assets/types";
import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useT } from "@reearth/services/i18n";

export const useManageAssets = ({
  selectedAssets,
  sort,
  searchTerm,
  isLoading,
  hasMoreAssets,
  onGetMore,
  onAssetUrlSelect,
  onRemove,
  onSortChange,
  onSearch,
}: {
  selectedAssets?: Asset[];
  sort?: { type?: SortType | null; reverse?: boolean };
  searchTerm?: string;
  isLoading?: boolean;
  hasMoreAssets?: boolean;
  onGetMore?: () => void | Promise<void>;
  onAssetUrlSelect?: (asset?: string) => void;
  onRemove?: (assetIds: string[]) => void;
  onSortChange?: (type?: string, reverse?: boolean) => void;
  onSearch?: (term?: string | undefined) => void;
}) => {
  const t = useT();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  const iconChoice =
    sort?.type === "name"
      ? sort?.reverse
        ? "filterNameReverse"
        : "filterName"
      : sort?.type === "size"
      ? sort?.reverse
        ? "filterSizeReverse"
        : "filterSize"
      : sort?.reverse
      ? "filterTimeReverse"
      : "filterTime";

  const handleRemove = useCallback(() => {
    if (selectedAssets?.length) {
      onRemove?.(selectedAssets.map(a => a.id));
      onAssetUrlSelect?.();
      setDeleteModalVisible(false);
    }
  }, [onRemove, onAssetUrlSelect, selectedAssets]);

  const handleReverse = useCallback(() => {
    onSortChange?.(undefined, !sort?.reverse);
  }, [onSortChange, sort?.reverse]);

  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm ?? "");
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
    },
    [setLocalSearchTerm],
  );
  const handleSearch = useCallback(() => {
    if (!localSearchTerm || localSearchTerm.length < 1) {
      onSearch?.(undefined);
    } else {
      onSearch?.(localSearchTerm);
    }
  }, [onSearch, localSearchTerm]);

  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current && !isLoading && hasMoreAssets) autoFillPage(wrapperRef, onGetMore);
  }, [hasMoreAssets, isLoading, onGetMore]);

  return {
    iconChoice,
    deleteModalVisible,
    sortOptions,
    localSearchTerm,
    wrapperRef,
    handleSearchInputChange,
    handleReverse,
    handleSearch,
    openDeleteModal,
    closeDeleteModal,
    handleRemove,
    onScrollToBottom,
  };
};
