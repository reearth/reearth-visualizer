import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";

import { ProjectPayload, Visualizer } from "@reearth/services/gql/__gen__/graphql";
import { CREATE_PROJECT, GET_PROJECT } from "@reearth/services/gql/queries/project";
import { CREATE_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../state";

import { MutationReturn, QueryReturn } from "./types";

export type Project = ProjectPayload["project"];

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useProjectQuery = useCallback((projectId?: string): QueryReturn<Partial<Project>> => {
    const { data, ...rest } = useQuery(GET_PROJECT, {
      variables: { projectId: projectId ?? "" },
      skip: !projectId,
    });

    const project = data?.node?.__typename === "Project" ? data.node : undefined;

    return { project, ...rest };
  }, []);

  const [createNewProject] = useMutation(CREATE_PROJECT);
  const [createScene] = useMutation(CREATE_SCENE, { refetchQueries: ["GetProjects"] });

  const useCreateProject = useCallback(
    async (
      workspaceId: string,
      visualizer: Visualizer,
      name: string,
      coreSupport: boolean,
      description?: string,
      imageUrl?: string,
    ): Promise<MutationReturn<Partial<Project>>> => {
      const { data: projectResults, errors: projectErrors } = await createNewProject({
        variables: {
          teamId: workspaceId,
          visualizer,
          name,
          description: description ?? "",
          imageUrl: imageUrl ?? "",
          coreSupport: !!coreSupport,
        },
      });
      if (projectErrors || !projectResults?.createProject) {
        console.log("GraphQL: Failed to create project", projectErrors);
        setNotification({ type: "error", text: t("Failed to create project.") });

        return { status: "error" };
      } else {
        const { errors: sceneErrors } = await createScene({
          variables: { projectId: projectResults?.createProject.project.id },
        });
        if (sceneErrors) {
          console.log("GraphQL: Failed to create scene for project creation.", sceneErrors);
          setNotification({ type: "error", text: t("Failed to create project.") });

          return { status: "error" };
        }
      }

      setNotification({ type: "success", text: t("Successfully created project!") });
      return { data: projectResults.createProject.project, status: "success" };
    },
    [createNewProject, createScene, setNotification, t],
  );

  return {
    useProjectQuery,
    useCreateProject,
  };
};
