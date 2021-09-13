import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

import {
  DatasetSchemasQuery,
  useSceneQuery,
  useDatasetSchemasQuery,
  useImportDatasetMutation,
  useRemoveDatasetMutation,
} from "@reearth/gql";
import { useTeam, useProject } from "@reearth/state";

type Nodes = NonNullable<DatasetSchemasQuery["scene"]>["datasetSchemas"]["nodes"];

type DatasetSchemas = NonNullable<Nodes[number]>[];

export default (projectId: string) => {
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const { data: sceneData } = useSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const sceneId = sceneData?.scene?.id;

  const { data } = useDatasetSchemasQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const nodes = data?.scene?.datasetSchemas.nodes ?? [];

  const datasetSchemas = nodes.filter(Boolean) as DatasetSchemas;
  const client = useApolloClient();

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

  return {
    currentTeam,
    currentProject,
    datasetSchemas,
    handleDatasetImport,
    handleRemoveDataset,
  };
};
