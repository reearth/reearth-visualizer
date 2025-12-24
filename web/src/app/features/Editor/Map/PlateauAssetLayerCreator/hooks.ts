import { useDatasetById, useDatasets } from "@reearth/services/plateau/graphql";
import { DatasetFormat } from "@reearth/services/plateau/graphql/types/catalog";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LayerAddProps } from "../../hooks/useLayers";
import { showPlateauAssetLayerCreatorAtom } from "../state";

import {
  useSelectedPlateauDatasetItem,
  useSelectedPlateauDatasetId
} from "./atoms";
import { PlateauDatasetType } from "./constants";
import { toDataType } from "./utils";

export default ({
  onLayerAdd,
  sceneId
}: {
  onLayerAdd: (layerAddInp: LayerAddProps) => void;
  sceneId: string;
}) => {
  const showPlateauAssetLayerCreater = useSetAtom(
    showPlateauAssetLayerCreatorAtom
  );

  const [selectedPlateauDatasetId] = useSelectedPlateauDatasetId();
  const { data: datasetData, loading: loadingDataset } = useDatasetById(
    selectedPlateauDatasetId ?? "",
    { skip: !selectedPlateauDatasetId }
  );

  const dataset = useMemo(() => {
    return datasetData?.node;
  }, [datasetData]);

  const [selectedPlateauDatasetItem, setSelectedPlateauDatasetItem] =
    useSelectedPlateauDatasetItem();
  const handleSelectDatasetItem = useCallback(
    (
      item: {
        id: string;
        format: DatasetFormat;
        name: string;
        url: string;
        layers?: string[] | null;
      } | null
    ) => {
      setSelectedPlateauDatasetItem(item);
    },
    [setSelectedPlateauDatasetItem]
  );

  useEffect(() => {
    if (dataset?.items && dataset.items.length > 0) {
      handleSelectDatasetItem(dataset.items[0]);
    } else {
      handleSelectDatasetItem(null);
    }
  }, [dataset, handleSelectDatasetItem]);

  const addLayerDisabled = !selectedPlateauDatasetItem || loadingDataset;

  const handleLayerAdd = useCallback(async () => {
    if (!selectedPlateauDatasetItem) return;

    const type = toDataType(selectedPlateauDatasetItem.format);
    if (!type) return;

    await onLayerAdd({
      title:
        selectedPlateauDatasetItem.format === dataset?.name.split("(")[0]
          ? selectedPlateauDatasetItem.name
          : `${dataset.name} - ${selectedPlateauDatasetItem.name}`,
      layerType: "simple",
      sceneId,
      config: {
        data: {
          type,
          url: selectedPlateauDatasetItem.url,
          layers: selectedPlateauDatasetItem.layers ?? []
        }
      }
    });

    showPlateauAssetLayerCreater(false);
  }, [
    onLayerAdd,
    sceneId,
    selectedPlateauDatasetItem,
    showPlateauAssetLayerCreater,
    dataset
  ]);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchInput(text);
    },
    [setSearchInput]
  );

  const [searchText, setSearchText] = useState("");
  const handleSearch = useCallback(() => {
    setSearchText(searchInput.trim());
  }, [searchInput]);
  const { data: searchData, loading: searchLoading } = useDatasets(
    {
      searchTokens: searchText ? searchText?.split(/\s+/).filter(Boolean) : []
    },
    { skip: !searchText }
  );

  const searchDatasets = useMemo(() => {
    return searchData?.datasets?.map((dataset) => ({
      id: dataset.id,
      label: dataset.name,
      type: dataset.type.code as PlateauDatasetType
    }));
  }, [searchData]);

  useEffect(() => {
    if (searchInput.trim() === "") {
      setSearchText("");
    }
  }, [searchInput]);

  return {
    dataset,
    selectedPlateauDatasetItem,
    handleSelectDatasetItem,
    addLayerDisabled,
    handleLayerAdd,
    searchInput,
    handleSearchChange,
    searchDatasets,
    searchText,
    searchLoading,
    handleSearch
  };
};
