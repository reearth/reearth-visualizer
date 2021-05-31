import { useState, useCallback, useEffect } from "react";
import useFileInput from "use-file-input";

export type FilterTypes = "time" | "size" | "name";

export type LayoutTypes = "medium" | "small" | "list";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export default ({
  assets,
  isMultipleSelectable,
  accept,
  onCreateAsset,
  initialAsset,
  selectAsset,
  selectedAssets,
}: {
  assets?: Asset[];
  isMultipleSelectable?: boolean;
  accept?: string;
  onCreateAsset?: (file: File) => void;
  initialAsset?: Asset;
  selectAsset?: (assets: Asset[]) => void;
  selectedAssets?: Asset[];
}) => {
  const [layoutType, setLayoutType] = useState<LayoutTypes>("medium");
  const [currentSaved, setCurrentSaved] = useState(initialAsset);
  const [reverse, setReverse] = useState(false);

  const [searchResults, setSearchResults] = useState<Asset[]>();
  const [filterSelected, selectFilter] = useState<FilterTypes>("time");

  const [filteredAssets, setAssets] = useState(assets);

  const iconChoice =
    filterSelected === "name"
      ? reverse
        ? "filterNameReverse"
        : "filterName"
      : filterSelected === "size"
      ? reverse
        ? "filterSizeReverse"
        : "filterSize"
      : reverse
      ? "filterTimeReverse"
      : "filterTime";

  const handleFilterChange = useCallback(
    (f: FilterTypes) => {
      selectFilter(f);
      setReverse(false);
      setCurrentSaved(initialAsset);
      if (!assets) return;
      const newArray =
        f === "time"
          ? [...assets]
          : [...assets].sort((a: Asset, a2: Asset) => {
              return f === "name"
                ? a.name.localeCompare(a2.name)
                : a[f] < a2[f]
                ? -1
                : a[f] > a2[f]
                ? 1
                : 0;
            });
      setAssets(newArray);
    },
    [assets, initialAsset],
  );

  useEffect(() => {
    if (!assets) return;
    handleFilterChange(filterSelected);
  }, [handleFilterChange, filterSelected, assets]);

  const handleAssetsSelect = (asset: Asset) => {
    selectedAssets?.includes(asset)
      ? selectAsset?.(selectedAssets?.filter(a => a !== asset))
      : selectAsset?.(
          isMultipleSelectable && selectedAssets ? [...selectedAssets, asset] : [asset],
        );
  };

  const handleFileSelect = useFileInput(files => onCreateAsset?.(files[0]), {
    accept,
    multiple: isMultipleSelectable,
  });

  const handleUploadToAsset = useCallback(() => {
    handleFileSelect();
  }, [handleFileSelect]);

  const handleReverse = useCallback(() => {
    setReverse(!reverse);
    if (!filteredAssets) return;
    setAssets(filteredAssets.reverse());
  }, [filteredAssets, reverse]);

  const handleSearch = useCallback(
    (value: string) => {
      if (!value) {
        setSearchResults(undefined);
      } else {
        if (!filteredAssets) return;
        setSearchResults(filteredAssets.filter(a => a.name.toLowerCase().includes(value)));
      }
    },
    [filteredAssets],
  );

  return {
    layoutType,
    setLayoutType,
    filteredAssets,
    handleFilterChange,
    filterSelected,
    currentSaved,
    searchResults,
    iconChoice,
    handleAssetsSelect,
    handleUploadToAsset,
    handleReverse,
    handleSearch,
  };
};
