import { useCallback, useMemo } from "react";

import {
  useAddLayerGroupFromDatasetSchemaMutation,
  useGetDatasetsForDatasetInfoPaneQuery,
  useGetScenePluginsForDatasetInfoPaneQuery,
  useUpdatePropertyValueMutation,
  useRefreshHostedCsvMutation,
} from "@reearth/classic/gql";
import { useLang, useT } from "@reearth/services/i18n";
import { useCesiumScene, useNotification, useProject, useRootLayerId, useSelected } from "@reearth/services/state";

import { processDatasets, processDatasetHeaders, processPrimitives, processDatasetToLocation } from "./convert";
import { Cartesian3, Cartographic } from "cesium";
import { valueToGQL, valueTypeToGQL } from "@reearth/classic/util/value";
import { isHttpUrl } from "@reearth/classic/util/util";

export default () => {
  const lang = useLang();
  const [scene] = useCesiumScene();
  const [selected] = useSelected();
  const [project] = useProject();
  const [addLayerGroupFromDatasetSchemaMutation] = useAddLayerGroupFromDatasetSchemaMutation();
  const [refreshHostedCsvMutation] = useRefreshHostedCsvMutation();
  const selectedDatasetSchemaId = selected?.type === "dataset" ? selected.datasetSchemaId : "";
  const [rootLayerId, _] = useRootLayerId();
  const [, setNotification] = useNotification();
  const t = useT();
  const [updatePropertyValue] = useUpdatePropertyValueMutation();
  const { data: rawDatasets, loading: datasetsLoading } = useGetDatasetsForDatasetInfoPaneQuery({
    variables: {
      datasetSchemaId: selected?.type === "dataset" ? selected.datasetSchemaId : "",
      first: 1000,
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

  const selectedDatasetSchema = rawDatasets?.datasets?.nodes?.[0]?.schema;
  const isHosted = useMemo(() => isHttpUrl(selectedDatasetSchema?.url || ""), [selectedDatasetSchema?.url]);

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

      if (result.data?.addLayerGroup?.layer) {
        const makerLocation = processDatasetToLocation(rawDatasets?.datasets?.nodes)
        const layers = result.data?.addLayerGroup?.layer?.layers;
        if (makerLocation?.length > 0 && layers?.length > 0 && scene) {
          scene?.clampToHeightMostDetailed(makerLocation.map(({ location }) => Cartesian3.fromDegrees(location?.lng || 0, location?.lat || 0))).then((clampedPositions) => {
            if (!clampedPositions?.length) return;
            clampedPositions.map((clampedPos: Cartesian3, index: number) => {
              if (clampedPos) {
                const height = Cartographic.fromCartesian(clampedPos)?.height;
                const itemId = undefined
                const schemaGroupId = "default";
                const fieldId = "height";
                const vt = "number"
                const gvt: any = valueTypeToGQL(vt);
                const propertyId = layers.find(layerProp => (layerProp as any)?.linkedDatasetId === makerLocation[index].id)?.property?.id;
                if (propertyId) {
                  updatePropertyValue({
                    variables: {
                      propertyId,
                      itemId,
                      schemaGroupId,
                      fieldId,
                      value: valueToGQL(height + 0.5, vt),
                      type: gvt,
                      lang: lang,
                    },
                  });
                }
              }
            })
          });
        }
      }
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
      datasets,
    ],
  );

  const handleRefresh = useCallback(async () => {
    if (!selectedDatasetSchemaId) return;
    try {
      await refreshHostedCsvMutation({
        variables: { schemaId: selectedDatasetSchemaId },
      });
      setNotification({ type: "success", text: t("Dataset refreshed") });
    } catch (e) {
      setNotification({ type: "error", text: t("Failed to refresh dataset") });
    }
  }, [selectedDatasetSchemaId, refreshHostedCsvMutation, setNotification, t]);

  return {
    datasets: datasets?.length > 0 ? datasets.slice(0, 10) : [],
    datasetHeaders: datasetHeaders?.length > 0 ? datasetHeaders.slice(0, 10) : [],
    loading: datasetsLoading || scenePluginLoading,
    primitiveItems,
    handleAddLayerGroupFromDatasetSchema,
    selectedDatasetSchema,
    isHosted,
    handleRefresh,
  };
};
