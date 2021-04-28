import { useCallback } from "react";
import { useLocalState } from "@reearth/state";
import {
  DatasetSchemasQuery,
  useSceneQuery,
  useDatasetSchemasQuery,
  useImportDatasetMutation,
  useRemoveDatasetMutation,
} from "@reearth/gql";

type Nodes = NonNullable<DatasetSchemasQuery["scene"]>["datasetSchemas"]["nodes"];

type DatasetSchemas = NonNullable<Nodes[number]>[];

export default (projectId: string) => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

  const { data: sceneData } = useSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const sceneId = sceneData?.scene?.id;

  const { data, refetch } = useDatasetSchemasQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const nodes = data?.scene?.datasetSchemas.nodes ?? [];

  const datasetSchemas = nodes.filter(Boolean) as DatasetSchemas;

  const [importDatasetMutation] = useImportDatasetMutation();

  const importDataset = useCallback(
    (file: FileList) => {
      sceneId && importDatasetMutation({ variables: { file, sceneId } });
    },
    [sceneId, importDatasetMutation],
  );

  const [removeDatasetSchemaMutation] = useRemoveDatasetMutation();

  const removeDatasetSchema = useCallback(
    async (schemaId: string) => {
      await removeDatasetSchemaMutation({ variables: { schemaId } });
      await refetch();
    },
    [removeDatasetSchemaMutation, refetch],
  );

  return { currentTeam, currentProject, datasetSchemas, importDataset, removeDatasetSchema };
};
