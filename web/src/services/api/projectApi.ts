import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { type PublishStatus } from "@reearth/beta/features/Editor/tabs/publish/Nav/PublishModal/hooks";
import {
  UpdateProjectInput,
  ProjectPayload,
  Visualizer,
  DeleteProjectInput,
  ArchiveProjectMutationVariables,
  UpdateProjectBasicAuthMutationVariables,
  UpdateProjectAliasMutationVariables,
} from "@reearth/services/gql/__gen__/graphql";
import {
  ARCHIVE_PROJECT,
  CHECK_PROJECT_ALIAS,
  CREATE_PROJECT,
  DELETE_PROJECT,
  GET_PROJECT,
  PUBLISH_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_ALIAS,
  UPDATE_PROJECT_BASIC_AUTH,
} from "@reearth/services/gql/queries/project";
import { CREATE_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../state";

import { toGqlStatus } from "./toGqlStatus";
import { MutationReturn } from "./types";

import { useStorytellingFetcher } from ".";

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

  const useProjectAliasCheckLazyQuery = useCallback(() => {
    return useLazyQuery(CHECK_PROJECT_ALIAS);
  }, []);

  const [createNewProject] = useMutation(CREATE_PROJECT);
  const [createScene] = useMutation(CREATE_SCENE, { refetchQueries: ["GetProjects"] });
  const { useCreateStoryPage } = useStorytellingFetcher();

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
        const { data: sceneResults, errors: sceneErrors } = await createScene({
          variables: { projectId: projectResults?.createProject.project.id },
        });
        if (sceneErrors) {
          console.log("GraphQL: Failed to create scene for project creation.", sceneErrors);
          setNotification({ type: "error", text: t("Failed to create project.") });

          return { status: "error" };
        } else if (sceneResults?.createScene?.scene.id) {
          const { data, errors: storyPageErrors } = await useCreateStoryPage({
            sceneId: sceneResults.createScene.scene.id,
            storyId: sceneResults.createScene.scene.stories[0].id,
          });
          console.log("DDD", data);
          if (storyPageErrors) {
            setNotification({
              type: "error",
              text: t("Failed to create story page on project creation."),
            });

            return { status: "error" };
          }
        }
      }

      setNotification({ type: "success", text: t("Successfully created project!") });
      return { data: projectResults.createProject.project, status: "success" };
    },
    [createNewProject, createScene, useCreateStoryPage, setNotification, t],
  );

  const [publishProjectMutation, { loading: publishProjectLoading }] = useMutation(
    PUBLISH_PROJECT,
    {
      refetchQueries: ["GetProject"],
    },
  );

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

  const [updateProjectMutation] = useMutation(UPDATE_PROJECT, {
    refetchQueries: ["GetProject"],
  });
  const useUpdateProject = useCallback(
    async (input: UpdateProjectInput) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await updateProjectMutation({ variables: { ...input } });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to update project", errors);
        setNotification({ type: "error", text: t("Failed to update project.") });

        return { status: "error" };
      }

      setNotification({ type: "success", text: t("Successfully updated project!") });
      return { data: data?.updateProject?.project, status: "success" };
    },
    [updateProjectMutation, t, setNotification],
  );

  const [archiveProjectMutation] = useMutation(ARCHIVE_PROJECT, {
    refetchQueries: ["GetProject"],
  });
  const useArchiveProject = useCallback(
    async (input: ArchiveProjectMutationVariables) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await archiveProjectMutation({ variables: { ...input } });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to archive project", errors);
        setNotification({
          type: "error",
          text: input.archived
            ? t("Failed to archive project.")
            : t("Failed to unarchive project."),
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: input.archived
          ? t("Successfully archive project!")
          : t("Successfully unarchived the project. You can now edit this project."),
      });
      return { status: "success" };
    },
    [archiveProjectMutation, t, setNotification],
  );

  const [deleteProjectMutation] = useMutation(DELETE_PROJECT, {
    refetchQueries: ["GetProject"],
  });
  const useDeleteProject = useCallback(
    async (input: DeleteProjectInput) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await deleteProjectMutation({ variables: { ...input } });

      if (errors || !data?.deleteProject) {
        console.log("GraphQL: Failed to delete project", errors);
        setNotification({ type: "error", text: t("Failed to delete project.") });

        return { status: "error" };
      }

      setNotification({ type: "success", text: t("Successfully delete project!") });
      return { status: "success" };
    },
    [deleteProjectMutation, t, setNotification],
  );

  const [updateProjectBasicAuthMutation] = useMutation(UPDATE_PROJECT_BASIC_AUTH, {
    refetchQueries: ["GetProject"],
  });
  const useUpdateProjectBasicAuth = useCallback(
    async (input: UpdateProjectBasicAuthMutationVariables) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await updateProjectBasicAuthMutation({ variables: { ...input } });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to update project", errors);
        setNotification({ type: "error", text: t("Failed to update project.") });

        return { status: "error" };
      }

      setNotification({ type: "success", text: t("Successfully updated project!") });
      return { data: data?.updateProject?.project, status: "success" };
    },
    [updateProjectBasicAuthMutation, t, setNotification],
  );

  const [updateProjectAliasMutation] = useMutation(UPDATE_PROJECT_ALIAS);
  const useUpdateProjectAlias = useCallback(
    async (input: UpdateProjectAliasMutationVariables) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await updateProjectAliasMutation({ variables: { ...input } });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to update project", errors);
        setNotification({ type: "error", text: t("Failed to update project.") });

        return { status: "error" };
      }

      setNotification({ type: "success", text: t("Successfully updated project!") });
      return { data: data?.updateProject?.project, status: "success" };
    },
    [updateProjectAliasMutation, t, setNotification],
  );

  return {
    publishProjectLoading,
    useProjectQuery,
    useProjectAliasCheckLazyQuery,
    useCreateProject,
    usePublishProject,
    useUpdateProject,
    useArchiveProject,
    useDeleteProject,
    useUpdateProjectBasicAuth,
    useUpdateProjectAlias,
  };
};
