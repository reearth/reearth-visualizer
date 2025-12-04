import { useAreas, useDatasetById } from "@reearth/services/plateau/graphql";
import {
  AreaType,
  DatasetFormat
} from "@reearth/services/plateau/graphql/types/catalog";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

import { LayerAddProps } from "../../hooks/useLayers";
import { showPlateauAssetLayerCreatorAtom } from "../state";

import { useSelectedDatasetItem, useSelectedId } from "./atoms";
import { TreeItemType } from "./TreeItem";

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

  const { data: prefecturesData, isLoading: loadingPrefectures } = useAreas({
    includeParents: true,
    areaTypes: [AreaType.Prefecture]
  });

  const prefectures: TreeItemType[] = useMemo(() => {
    if (!prefecturesData) return [];

    return prefecturesData.areas.map((area) => ({
      id: area.code,
      label: area.name
    }));
  }, [prefecturesData]);

  const [selectedId] = useSelectedId();
  const { data: datasetData, isLoading: loadingDataset } = useDatasetById(
    selectedId ?? "",
    { skip: !selectedId }
  );

  const dataset = useMemo(() => {
    return datasetData?.node;
  }, [datasetData]);

  const [selectedDatasetItem, setSelectedDatasetItem] =
    useSelectedDatasetItem();
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
      setSelectedDatasetItem(item);
    },
    [setSelectedDatasetItem]
  );

  useEffect(() => {
    if (dataset?.items && dataset.items.length > 0) {
      handleSelectDatasetItem(dataset.items[0]);
    } else {
      handleSelectDatasetItem(null);
    }
  }, [dataset, handleSelectDatasetItem]);

  const addLayerDisabled =
    !selectedDatasetItem || loadingPrefectures || loadingDataset;

  const handleLayerAdd = useCallback(async () => {
    if (!selectedDatasetItem) return;

    const type = toDataType(selectedDatasetItem.format);
    if (!type) return;

    await onLayerAdd({
      title:
        selectedDatasetItem.format === dataset?.name.split("(")[0]
          ? selectedDatasetItem.name
          : `${dataset.name} - ${selectedDatasetItem.name}`,
      layerType: "simple",
      sceneId,
      config: {
        data: {
          type,
          url: selectedDatasetItem.url,
          layers: selectedDatasetItem.layers ?? []
        }
      }
    });

    showPlateauAssetLayerCreater(false);
  }, [
    onLayerAdd,
    sceneId,
    selectedDatasetItem,
    showPlateauAssetLayerCreater,
    dataset
  ]);

  return {
    prefectures,
    dataset,
    selectedDatasetItem,
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
