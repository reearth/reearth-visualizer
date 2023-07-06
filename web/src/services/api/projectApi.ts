import {
  Visualizer,
  useCreateProjectMutation,
  useCreateSceneMutation,
  useGetProjectQuery,
} from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

import { CreateFuncReturn } from "./types";

export const useProjectQuery = (projectId?: string) => {
  const { data, ...rest } = useGetProjectQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const project = data?.node?.__typename === "Project" ? data.node : undefined;

  return { project, ...rest };
};

export const useProjectCreate = async (
  workspaceId: string,
  visualizer: Visualizer,
  name: string,
  coreSupport: boolean,
  description?: string,
  imageUrl?: string,
): Promise<CreateFuncReturn> => {
  const [createNewProject] = useCreateProjectMutation();
  const [createScene] = useCreateSceneMutation({ refetchQueries: ["GetProjects"] });
  const t = useT();

  const results = await createNewProject({
    variables: {
      teamId: workspaceId,
      visualizer,
      name,
      description: description ?? "",
      imageUrl: imageUrl ?? "",
      coreSupport: !!coreSupport,
    },
  });
  if (results.errors || !results.data?.createProject) {
    console.log("GraphQL: Failed to create project");
    return { success: false, error: t("Failed to create project.") };
  } else {
    const scene = await createScene({
      variables: { projectId: results.data.createProject.project.id },
    });
    if (scene.errors) {
      console.log("GraphQL: Failed to create scene for project creation.");
      return { success: false, error: t("Failed to create project.") };
    }
  }
  return { success: true };
};
