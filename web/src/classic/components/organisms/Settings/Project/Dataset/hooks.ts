import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

import { useAuth } from "@reearth/beta/services/auth";
import { useT } from "@reearth/beta/services/i18n";
import {
  useWorkspace,
  useProject,
  useNotification,
  useSessionWorkspace,
} from "@reearth/classic/state";
import {
  DatasetsListQuery,
  useGetProjectSceneQuery,
  useImportDatasetMutation,
  useRemoveDatasetMutation,
  useDatasetsListQuery,
} from "@reearth/gql";

type Nodes = NonNullable<DatasetsListQuery["datasetSchemas"]["nodes"]>;

type DatasetSchemas = NonNullable<Nodes[number]>[];

const datasetPerPage = 20;

export default (projectId: string) => {
  const t = useT();
  const { getAccessToken } = useAuth();
  const [currentWorkspace] = useSessionWorkspace();
  const [lastWorkspace] = useWorkspace();

  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const client = useApolloClient();

  const { data: sceneData } = useGetProjectSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const sceneId = sceneData?.scene?.id;

  const { data, fetchMore, loading, networkStatus } = useDatasetsListQuery({
    variables: { sceneId: sceneId ?? "", first: datasetPerPage },
    skip: !sceneId,
    notifyOnNetworkStatusChange: true,
  });

  const nodes = data?.datasetSchemas.edges.map(e => e.node) ?? [];

  const datasetSchemas = nodes.filter(Boolean) as DatasetSchemas;

  const hasMoreDataSets =
    data?.datasetSchemas?.pageInfo.hasNextPage || data?.datasetSchemas?.pageInfo.hasPreviousPage;

  const isRefetchingDataSets = networkStatus === 3;

  const handleGetMoreDataSets = useCallback(() => {
    if (hasMoreDataSets) {
      fetchMore({
        variables: {
          after: data?.datasetSchemas?.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [data?.datasetSchemas?.pageInfo, fetchMore, hasMoreDataSets]);

  const [removeDatasetSchema] = useRemoveDatasetMutation();
  const handleRemoveDataset = useCallback(
    async (schemaId: string) => {
      const results = await removeDatasetSchema({
        variables: {
          schemaId,
          force: true,
        },
      });
      if (results.errors) {
        setNotification({
          type: "error",
          text: t("Failed to delete dataset."),
        });
      } else {
        setNotification({
          type: "info",
          text: t("Dataset was successfully deleted."),
        });
        // re-render
        await client.resetStore();
      }
    },
    [client, removeDatasetSchema, setNotification, t],
  );

  // Add
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

  //Download file

  const handleDownloadFile = useCallback(
    async (id: string, name: string, onLoad: () => void) => {
      if (!id || !window.REEARTH_CONFIG?.api) return;

      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const res = await fetch(`${window.REEARTH_CONFIG.api}/datasets/${id}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const blob = await res.blob();
      const download = document.createElement("a");
      download.download = name;
      download.href = URL.createObjectURL(blob);
      download.click();
      if (onLoad) {
        onLoad();
      }
    },
    [getAccessToken],
  );

  return {
    currentWorkspace: currentWorkspace ?? lastWorkspace,
    currentProject,
    datasetSchemas,
    datasetLoading: loading ?? isRefetchingDataSets,
    hasMoreDataSets,
    handleDatasetImport,
    handleRemoveDataset,
    handleGetMoreDataSets,
    handleDownloadFile,
  };
};
