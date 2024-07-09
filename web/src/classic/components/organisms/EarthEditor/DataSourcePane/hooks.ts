import { useApolloClient } from "@apollo/client";
import { useMemo, useCallback } from "react";

import {
  DatasetSchema,
  DataSource,
} from "@reearth/classic/components/molecules/EarthEditor/DatasetPane/hooks";
import {
  useSyncDatasetMutation,
  useImportDatasetMutation,
  useImportDatasetFromGoogleSheetMutation,
  useRemoveDatasetMutation,
  useGetDatasetSchemasWithCountQuery,
} from "@reearth/beta/graphql";
import { useT, useLang } from "@reearth/services/i18n";
import {
  useSceneId,
  useNotification,
  useSelected,
  useProject,
  NotificationType,
  useCurrentTheme,
} from "@reearth/services/state";

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();
  const [selected, select] = useSelected();
  const [sceneId] = useSceneId();
  const [project] = useProject();

  const { data, loading } = useGetDatasetSchemasWithCountQuery({
    variables: { projectId: project?.id || "", first: 100 },
  });

  const datasetMessageSuccess = t("Successfully added the dataset!");
  const datasetMessageFailure = t("Failed to add the dataset.");
  const datasetDeleteMessageSuccess = t("Successfully deleted the dataset!");
  const datasetDeleteMessageFailure = t("Failed to delete the dataset.");

  const datasetSchemas = useMemo(
    () =>
      data?.scene
        ? data.scene.datasetSchemas.nodes
          .map<DatasetSchema | undefined>(n =>
            n
              ? {
                id: n.id,
                name: n.name,
                source: n.source as DataSource,
                totalCount: n.totalCount,
              }
              : undefined,
          )
          .filter((e): e is DatasetSchema => !!e)
        : [],
    [data],
  );

  const handleDatasetSchemaSelect = useCallback(
    (datasetSchemaId: string) => {
      select({ type: "dataset", datasetSchemaId: datasetSchemaId });
    },
    [select],
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
      const result = await importData({
        variables: {
          file,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });

      if (result.errors) {
        setNotification({
          type: "error",
          text: datasetMessageFailure,
        });
      } else {
        setNotification({
          type: "success",
          text: datasetMessageSuccess,
        });
      }
      // re-render
      await client.resetStore();
    },
    [client, importData, sceneId, datasetMessageSuccess, datasetMessageFailure, setNotification],
  );

  const [importGoogleSheetData] = useImportDatasetFromGoogleSheetMutation();

  const handleGoogleSheetDatasetImport = useCallback(
    async (accessToken: string, fileId: string, sheetName: string, schemeId: string | null) => {
      if (!sceneId) return;
      const result = await importGoogleSheetData({
        variables: {
          accessToken,
          fileId,
          sheetName,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });
      if (result.errors) {
        setNotification({ type: "error", text: datasetMessageFailure });
      } else {
        setNotification({ type: "success", text: datasetMessageSuccess });
      }
      // re-render
      await client.resetStore();
    },
    [
      client,
      importGoogleSheetData,
      sceneId,
      datasetMessageFailure,
      datasetMessageSuccess,
      setNotification,
    ],
  );

  const [removeDatasetSchema] = useRemoveDatasetMutation();
  const handleDatasetRemove = useCallback(
    async (schemaId: string) => {
      const result = await removeDatasetSchema({
        variables: {
          schemaId,
          force: true,
        },
      });
      if (result.errors) {
        setNotification({ type: "error", text: datasetDeleteMessageFailure });
      } else {
        setNotification({ type: "info", text: datasetDeleteMessageSuccess });
        select(undefined);
      }
      // re-render
      await client.resetStore();
    },
    [
      removeDatasetSchema,
      client,
      setNotification,
      datasetDeleteMessageFailure,
      datasetDeleteMessageSuccess,
      select,
    ],
  );

  const selectedDatasetSchemaId =
    selected?.type === "dataset" ? selected.datasetSchemaId : undefined;

  const handleNotificationChange = useCallback(
    (type: NotificationType, text: string, heading?: string) => {
      setNotification({ type, text, heading });
    },
    [setNotification],
  );

  const currentLang = useLang();
  const [currentTheme] = useCurrentTheme();

  return {
    datasetSchemas,
    loading,
    currentLang,
    currentTheme,
    selectedDatasetSchemaId,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleDatasetRemove,
    handleDatasetSchemaSelect,
    handleNotificationChange,
  };
};
