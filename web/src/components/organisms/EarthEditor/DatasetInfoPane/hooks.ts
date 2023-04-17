import { useCallback, useMemo } from "react";

import {
  useAddLayerGroupFromDatasetSchemaMutation,
  useGetDatasetsForDatasetInfoPaneQuery,
  useGetScenePluginsForDatasetInfoPaneQuery,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useNotification, useProject, useRootLayerId, useSelected } from "@reearth/state";

import { processDatasets, processDatasetHeaders, processPrimitives } from "./convert";

export default () => {
  const [selected] = useSelected();
  const [project] = useProject();
  const [addLayerGroupFromDatasetSchemaMutation] = useAddLayerGroupFromDatasetSchemaMutation();
  const selectedDatasetSchemaId = selected?.type === "dataset" ? selected.datasetSchemaId : "";
  const [rootLayerId, _] = useRootLayerId();
  const [, setNotification] = useNotification();
  const t = useT();
  const { data: rawDatasets, loading: datasetsLoading } = useGetDatasetsForDatasetInfoPaneQuery({
    variables: {
      datasetSchemaId: selected?.type === "dataset" ? selected.datasetSchemaId : "",
      first: 10,
    },
    skip: selected?.type !== "dataset",
  });

  const { data: rawScene, loading: scenePluginLoading } = useGetScenePluginsForDatasetInfoPaneQuery(
    {
      variables: {
        projectId: project?.id ? project.id : "",
      },
      skip: !project?.id,
    },
  );

  const datasets = useMemo(() => {
    return rawDatasets?.datasets?.nodes ? processDatasets(rawDatasets?.datasets?.nodes) : [];
  }, [rawDatasets?.datasets.nodes]);

  const datasetHeaders = useMemo(() => {
    return rawDatasets?.datasets.nodes ? processDatasetHeaders(rawDatasets.datasets.nodes) : [];
  }, [rawDatasets?.datasets.nodes]);

  const primitiveItems = useMemo(() => {
    const plugins = rawScene?.scene?.plugins.map(p => p.plugin);
    return plugins ? processPrimitives(plugins) : [];
  }, [rawScene?.scene?.plugins]);

  const messageCreateLayerGroupSuccess = t("Successfully created layer group");
  const messageCreateLayerGroupError = t("Failed to create layer group");

  const handleAddLayerGroupFromDatasetSchema = useCallback(
    async (pluginId: string, extensionId: string) => {
      if (!rootLayerId || !selectedDatasetSchemaId) return;
      const result = await addLayerGroupFromDatasetSchemaMutation({
        variables: {
          parentLayerId: rootLayerId,
          datasetSchemaId: selectedDatasetSchemaId,
          pluginId,
          extensionId,
        },
        refetchQueries: ["GetLayers"],
      });
      setNotification(
        result.errors
          ? { type: "error", text: messageCreateLayerGroupError }
          : { type: "success", text: messageCreateLayerGroupSuccess },
      );
    },
    [
      addLayerGroupFromDatasetSchemaMutation,
      messageCreateLayerGroupError,
      messageCreateLayerGroupSuccess,
      rootLayerId,
      selectedDatasetSchemaId,
      setNotification,
    ],
  );

  return {
    datasets,
    datasetHeaders,
    loading: datasetsLoading || scenePluginLoading,
    primitiveItems,
    handleAddLayerGroupFromDatasetSchema,
  };
};
