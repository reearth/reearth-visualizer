import { useMemo, useCallback } from "react";
import { useApolloClient } from "@apollo/client";

import {
  useGetAllDataSetsQuery,
  useAddLayerGroupFromDatasetSchemaMutation,
  useSyncDatasetMutation,
  useImportDatasetMutation,
  useImportGoogleSheetDatasetMutation,
  useRemoveDatasetMutation,
} from "@reearth/gql";
import { useSceneId, useNotification } from "@reearth/state";

import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";
import { DatasetSchema, DataSource } from "@reearth/components/molecules/EarthEditor/DatasetPane";

const pluginId = "reearth";
const extensionId = "marker";

export default () => {
  const [sceneId] = useSceneId();
  const [, setNotification] = useNotification();
  const [addLayerGroupFromDatasetSchemaMutation] = useAddLayerGroupFromDatasetSchemaMutation();

  const { data, loading } = useGetAllDataSetsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !sceneId,
  });

  const datasetSchemas = useMemo(
    () =>
      data
        ? data.datasetSchemas.nodes
            .map<DatasetSchema | undefined>(n =>
              n
                ? {
                    id: n.id,
                    name: n.name,
                    source: n.source as DataSource,
                    totalCount: n.datasets.totalCount,
                    onDrop: async (layerId: string, index?: number) => {
                      await addLayerGroupFromDatasetSchemaMutation({
                        variables: {
                          parentLayerId: layerId,
                          datasetSchemaId: n.id,
                          pluginId,
                          extensionId,
                          index,
                        },
                        refetchQueries: ["GetLayers"],
                      });
                    },
                  }
                : undefined,
            )
            .filter((e): e is DatasetSchema => !!e)
        : [],
    [addLayerGroupFromDatasetSchemaMutation, data],
  );

  // dataset sync
  const client = useApolloClient();
  const [syncData] = useSyncDatasetMutation();

  const handleDatasetSync = useCallback(
    async (value: string) => {
      if (!sceneId) return;
      await syncData({
        variables: { sceneId, url: value },
      });
      // re-render
      await client.resetStore();
    },
    [client, sceneId, syncData],
  );

  const [importData] = useImportDatasetMutation();

  const handleDatasetImport = useCallback(
    async (file: File, schemeId: string | null) => {
      if (!sceneId) return;
      await importData({
        variables: {
          file,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });
      // re-render
      await client.resetStore();
    },
    [client, importData, sceneId],
  );

  const [importGoogleSheetData] = useImportGoogleSheetDatasetMutation();

  const handleGoogleSheetDatasetImport = useCallback(
    async (accessToken: string, fileId: string, sheetName: string, schemeId: string | null) => {
      if (!sceneId) return;
      await importGoogleSheetData({
        variables: {
          accessToken,
          fileId,
          sheetName,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });
      // re-render
      await client.resetStore();
    },
    [client, importGoogleSheetData, sceneId],
  );

  const [removeDatasetSchema] = useRemoveDatasetMutation();
  const handleRemoveDataset = useCallback(
    async (schemaId: string) => {
      await removeDatasetSchema({
        variables: {
          schemaId,
          force: true,
        },
      });
      // re-render
      await client.resetStore();
    },
    [client, removeDatasetSchema],
  );

  const onNotify = useCallback(
    (type?: NotificationType, text?: string) => {
      if (!type || !text) return;
      setNotification({
        type: type,
        text: text,
      });
    },
    [setNotification],
  );

  return {
    datasetSchemas,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleRemoveDataset,
    loading,
    onNotify,
  };
};
