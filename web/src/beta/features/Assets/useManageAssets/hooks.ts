import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import useFileInput from "use-file-input";

import { autoFillPage, onScrollToBottom } from "@reearth/beta/utils/infinite-scroll";
import { useT } from "@reearth/services/i18n";

export type SortType = "date" | "name" | "size";

export const fileFormats = ".kml,.czml,.topojson,.geojson,.json,.gltf,.glb";

export const imageFormats = ".jpg,.jpeg,.png,.gif,.svg,.tiff,.webp";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export const useManageAssets = ({
  selectedAssets,
  sort,
  searchTerm,
  isLoading,
  hasMoreAssets,
  onGetMore,
  onCreateAssets,
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
  onGetMore?: () => void;
  onCreateAssets?: (files: FileList) => void;
  onAssetUrlSelect?: (asset?: string) => void;
  onRemove?: (assetIds: string[]) => void;
  onSortChange?: (type?: string, reverse?: boolean) => void;
  onSearch?: (term?: string | undefined) => void;
}) => {
  const t = useT();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const sortOptions: { key: SortType; label: string }[] = useMemo(
    () => [
      { key: "date", label: t("Date") },
      { key: "size", label: t("File size") },
      { key: "name", label: t("Alphabetical") },
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

  const handleFileSelect = useFileInput(files => onCreateAssets?.(files), {
    accept: imageFormats + "," + fileFormats,
    multiple: true,
  });

  const handleUploadToAsset = useCallback(() => {
    handleFileSelect();
  }, [handleFileSelect]);

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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalSearchTerm(e.currentTarget.value);
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
    handleUploadToAsset,
    handleReverse,
    handleSearch,
    openDeleteModal,
    closeDeleteModal,
    handleRemove,
    onScrollToBottom,
  };
};
