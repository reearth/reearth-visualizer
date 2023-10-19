import { useState, useCallback, useMemo } from "react";

import { Asset, SortType } from "@reearth/beta/features/Assets/types";
import { useT } from "@reearth/services/i18n";

export const useManageAssets = ({
  selectedAssets,
  sort,
  onAssetUrlSelect,
  onRemove,
  onSortChange,
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

  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  return {
    iconChoice,
    deleteModalVisible,
    sortOptions,
    handleReverse,
    openDeleteModal,
    closeDeleteModal,
    handleRemove,
  };
};
