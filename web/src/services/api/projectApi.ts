import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { PublishStatus } from "@reearth/beta/features/Editor/tabs/publish/Nav";
import {
  ProjectPayload,
  PublishmentStatus,
  Visualizer,
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_PROJECT,
  GET_PROJECT,
  PUBLISH_PROJECT,
} from "@reearth/services/gql/queries/project";
import { CREATE_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../state";

import { MutationReturn } from "./types";

export type Project = ProjectPayload["project"];

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useProjectQuery = useCallback((projectId?: string) => {
    const { data, ...rest } = useQuery(GET_PROJECT, {
      variables: { projectId: projectId ?? "" },
      skip: !projectId,
    });

    const project = useMemo(
      () => (data?.node?.__typename === "Project" ? data.node : undefined),
      [data?.node],
    );

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

  const [publishProjectMutation] = useMutation(PUBLISH_PROJECT, {
    refetchQueries: ["GetProject"],
  });

  const usePublishProject = useCallback(
    async (s: PublishStatus, projectId?: string, alias?: string) => {
      if (!projectId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, errors } = await publishProjectMutation({
        variables: { projectId, alias, status: gqlStatus },
      });

      if (errors || !data?.publishProject) {
        console.log("GraphQL: Failed to publish project", errors);
        setNotification({ type: "error", text: t("Failed to publish project.") });

        return { status: "error" };
      }

      setNotification({
        type: s === "limited" ? "success" : s == "published" ? "success" : "info",
        text:
          s === "limited"
            ? t("Successfully published your project!")
            : s == "published"
            ? t("Successfully published your project with search engine indexing!")
            : t("Successfully unpublished your project. Now nobody can access your project."),
      });
      return { data: data.publishProject.project, status: "success" };
    },
    [publishProjectMutation, t, setNotification],
  );

  return {
    useProjectQuery,
    useCreateProject,
    usePublishProject,
  };
};

const toGqlStatus = (status?: PublishStatus) => {
  return status === "limited"
    ? PublishmentStatus.Limited
    : status == "published"
    ? PublishmentStatus.Public
    : PublishmentStatus.Private;
};
