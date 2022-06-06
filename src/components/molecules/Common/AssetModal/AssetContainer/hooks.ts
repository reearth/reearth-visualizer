import { useState, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import useFileInput from "use-file-input";

export type SortType = "date" | "name" | "size";

export type LayoutTypes = "medium" | "small" | "list";

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

export default ({
  isMultipleSelectable,
  selectedAssets,
  sort,
  smallCardOnly,
  onCreateAssets,
  onAssetUrlSelect,
  onRemove,
  onSortChange,
  onSearch,
}: {
  isMultipleSelectable?: boolean;
  selectedAssets?: Asset[];
  sort?: { type?: SortType | null; reverse?: boolean };
  smallCardOnly?: boolean;
  onCreateAssets?: (files: FileList) => void;
  onAssetUrlSelect?: (asset?: string) => void;
  onRemove?: (assetIds: string[]) => void;
  onSortChange?: (type?: string, reverse?: boolean) => void;
  onSearch?: (term?: string | undefined) => void;
}) => {
  const intl = useIntl();
  const [layoutType, setLayoutType] = useState<LayoutTypes>(smallCardOnly ? "small" : "medium");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const sortOptions: { key: SortType; label: string }[] = useMemo(
    () => [
      { key: "date", label: intl.formatMessage({ defaultMessage: "Date" }) },
      { key: "size", label: intl.formatMessage({ defaultMessage: "File size" }) },
      { key: "name", label: intl.formatMessage({ defaultMessage: "Alphabetical" }) },
    ],
    [intl],
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
    multiple: isMultipleSelectable,
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

  const handleSearch = useCallback(
    (term?: string) => {
      if (!term || term.length < 1) {
        onSearch?.(undefined);
      } else {
        onSearch?.(term);
      }
    },
    [onSearch],
  );

  return {
    layoutType,
    iconChoice,
    deleteModalVisible,
    sortOptions,
    setLayoutType,
    handleUploadToAsset,
    handleReverse,
    handleSearch,
    setDeleteModalVisible,
    handleRemove,
  };
};
