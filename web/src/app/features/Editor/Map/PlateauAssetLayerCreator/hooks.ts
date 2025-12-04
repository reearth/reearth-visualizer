import { useDatasetById } from "@reearth/services/plateau/graphql";
import { DatasetFormat } from "@reearth/services/plateau/graphql/types/catalog";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

import { LayerAddProps } from "../../hooks/useLayers";
import { showPlateauAssetLayerCreatorAtom } from "../state";

import {
  useSelectedPlateauDatasetItem,
  useSelectedPlateauDatasetId
} from "./atoms";

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
  const { data: datasetData, isLoading: loadingDataset } = useDatasetById(
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

  return {
    dataset,
    selectedPlateauDatasetItem,
    handleSelectDatasetItem,
    addLayerDisabled,
    handleLayerAdd
  };
};

const toDataType = (format: DatasetFormat) => {
  switch (format) {
    case DatasetFormat.Geojson:
      return "geojson";
    case DatasetFormat.Cesium3Dtiles:
      return "3dtiles";
    case DatasetFormat.Mvt:
      return "mvt";
    case DatasetFormat.Csv:
      return "csv";
    case DatasetFormat.Czml:
      return "czml";
    case DatasetFormat.Wms:
      return "wms";
    case DatasetFormat.Gltf:
    case DatasetFormat.GtfsRealtime:
      return "gltf";
    case DatasetFormat.Tms:
      return "tms";
    case DatasetFormat.Tiles:
      return "tiles";
    default:
      return "";
  }
};
