import { Reference, StoreObject, useMutation } from "@apollo/client";
import {
  UpdateProjectInput,
  Visualizer,
  DeleteProjectInput,
  ArchiveProjectMutationVariables,
  UpdateProjectBasicAuthMutationVariables,
  UpdateProjectMetadataInput
} from "@reearth/services/gql/__gen__/graphql";
import {
  ARCHIVE_PROJECT,
  CREATE_PROJECT,
  DELETE_PROJECT,
  PUBLISH_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_BASIC_AUTH,
  UPDATE_PROJECT_METADATA
} from "@reearth/services/gql/queries/project";
import { CREATE_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useCallback } from "react";

import { useNotification } from "../../state";
import { useStoryMutations, useStoryPageMutations } from "../storytelling";
import { MutationReturn } from "../types"; // 16MB
import { type PublishStatus } from "../utils";
import { toGqlStatus } from "../utils";

import { Project } from "./types";

export const useProjectMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createNewProject] = useMutation(CREATE_PROJECT);
  const [createScene] = useMutation(CREATE_SCENE, {
    refetchQueries: ["GetProjects"]
  });
  const { createStory } = useStoryMutations();
  const { createStoryPage } = useStoryPageMutations();

  const createProject = useCallback(
    async (
      workspaceId: string,
      visualizer: Visualizer,
      name: string,
      coreSupport: boolean,
      projectAlias?: string,
      visibility?: string,
      description?: string,
      license?: string,
      readme?: string,
      topics?: string[]
    ): Promise<MutationReturn<Partial<Project>>> => {
      const { data: projectResults, errors: projectErrors } =
        await createNewProject({
          variables: {
            workspaceId: workspaceId,
            visualizer,
            name,
            description: description ?? "",
            coreSupport: !!coreSupport,
            projectAlias: projectAlias ?? "",
            visibility: visibility ? visibility : "private",
            license: license ?? "",
            readme: readme ?? "",
            topics: topics ?? undefined
          }
        });
      if (projectErrors || !projectResults?.createProject) {
        setNotification({
          type: "error",
          text: t("Failed to create project.")
        });

        return { status: "error" };
      }

      const { data: sceneResults, errors: sceneErrors } = await createScene({
        variables: { projectId: projectResults?.createProject.project.id }
      });
      if (sceneErrors || !sceneResults?.createScene) {
        setNotification({
          type: "error",
          text: t("Failed to create project.")
        });
        return { status: "error" };
      }

      const { data: storyResult, errors: storyErrors } = await createStory({
        sceneId: sceneResults.createScene.scene.id,
        title: t("Default"),
        index: 0
      });
      if (storyErrors || !storyResult?.createStory) {
        setNotification({
          type: "error",
          text: t("Failed to create project.")
        });
        return { status: "error" };
      } else if (storyResult?.createStory?.story.id) {
        const { errors: storyPageErrors } = await createStoryPage({
          sceneId: sceneResults.createScene.scene.id,
          storyId: storyResult?.createStory?.story.id
        });
        if (storyPageErrors) {
          setNotification({
            type: "error",
            text: t("Failed to create story page on project creation.")
          });

          return { status: "error" };
        }
      }

      setNotification({
        type: "success",
        text: t("Successfully created project!")
      });
      return { data: projectResults.createProject.project, status: "success" };
    },
    [
      createNewProject,
      createScene,
      createStory,
      t,
      setNotification,
      createStoryPage
    ]
  );

  const [publishProjectMutation] = useMutation(PUBLISH_PROJECT, {
    refetchQueries: ["GetProject"]
  });

  const publishProject = useCallback(
    async (s: PublishStatus, projectId?: string, alias?: string) => {
      if (!projectId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, errors } = await publishProjectMutation({
        variables: { projectId, alias, status: gqlStatus }
      });

      if (errors || !data?.publishProject) {
        console.log("GraphQL: Failed to publish project", errors);
        setNotification({
          type: "error",
          text: t("Failed to publish project.")
        });

        return { status: "error" };
      }

      setNotification({
        type:
          s === "limited" ? "success" : s == "published" ? "success" : "info",
        text:
          s === "limited"
            ? t("Successfully published your scene!")
            : s == "published"
              ? t(
                  "Successfully published your project with search engine indexing!"
                )
              : t(
                  "Successfully unpublished your scene. Now nobody can access your scene."
                )
      });
      return { data: data.publishProject.project, status: "success" };
    },
    [publishProjectMutation, t, setNotification]
  );

  const updatePublishProject = useCallback(
    async (s: PublishStatus, projectId?: string, alias?: string) => {
      if (!projectId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, errors } = await publishProjectMutation({
        variables: { projectId, alias, status: gqlStatus }
      });

      if (errors || !data?.publishProject) {
        console.log("GraphQL: Failed to update project", errors);
        setNotification({
          type: "error",
          text: t("Failed to update project.")
        });

        return { status: "error" };
      }

      setNotification({
        type:
          s === "limited" ? "success" : s == "published" ? "success" : "info",
        text:
          s === "limited"
            ? t("Successfully updated your scene!")
            : s == "published"
              ? t(
                  "Successfully updated your scene with search engine indexing!"
                )
              : t(
                  "Successfully updated your scene. Now nobody can access your scene."
                )
      });
      return { data: data.publishProject.project, status: "success" };
    },
    [publishProjectMutation, t, setNotification]
  );

  const [updateProjectMutation] = useMutation(UPDATE_PROJECT, {
    refetchQueries: ["GetProject", "GetStarredProjects"]
  });
  const updateProject = useCallback(
    async (input: UpdateProjectInput) => {
      if (!input.projectId) return { status: "error" };

      const { data, errors } = await updateProjectMutation({
        variables: { ...input }
      });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to update project", errors);
        setNotification({
          type: "error",
          text: t("Failed to update project.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully updated project!")
      });
      return { data: data?.updateProject?.project, status: "success" };
    },
    [updateProjectMutation, t, setNotification]
  );

  const [updateProjectRemoveMutation] = useMutation(UPDATE_PROJECT, {
    refetchQueries: ["GetProjects", "GetStarredProjects", "GetDeletedProjects"]
  });
  const updateProjectRecycleBin = useCallback(
    async (input: { projectId: string; deleted: boolean }) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await updateProjectRemoveMutation({
        variables: { ...input }
      });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to move project to Recycle bin", errors);
        setNotification({
          type: "error",
          text: input.deleted
            ? t("Failed to move to the Recycle bin.")
            : t("Failed to recover the project!")
        });

        return { status: "error" };
      }
      setNotification({
        type: "success",
        text: input.deleted
          ? t("Successfully moved to Recycle bin!")
          : t("Successfully recovered the project!")
      });
      return { data: data?.updateProject?.project, status: "success" };
    },
    [updateProjectRemoveMutation, setNotification, t]
  );

  const [archiveProjectMutation] = useMutation(ARCHIVE_PROJECT, {
    refetchQueries: ["GetProject"]
  });
  const archiveProject = useCallback(
    async (input: ArchiveProjectMutationVariables) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await archiveProjectMutation({
        variables: { ...input }
      });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to archive project", errors);
        setNotification({
          type: "error",
          text: input.archived
            ? t("Failed to archive project.")
            : t("Failed to unarchive project.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: input.archived
          ? t("Successfully archive project!")
          : t(
              "Successfully unarchived the project. You can now edit this project."
            )
      });
      return { status: "success" };
    },
    [archiveProjectMutation, t, setNotification]
  );

  const [deleteProjectMutation] = useMutation(DELETE_PROJECT, {
    refetchQueries: ["GetDeletedProjects"],
    update(cache, { data }) {
      if (data?.deleteProject?.projectId) {
        cache.modify({
          fields: {
            projects(existingData = {}, { readField }) {
              return {
                ...existingData,
                edges: (existingData.edges || []).filter(
                  (e: { node: Reference | StoreObject | undefined }) =>
                    readField("id", e.node) !== data?.deleteProject?.projectId
                )
              };
            }
          }
        });
      }
    }
  });

  const deleteProject = useCallback(
    async (input: DeleteProjectInput) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await deleteProjectMutation({
        variables: { ...input },
        context: {
          fetchOptions: {
            __timeout: 1000 * 60 * 30 // 30 minutes
          }
        }
      });

      if (errors || !data?.deleteProject) {
        console.log("GraphQL: Failed to delete project", errors);
        setNotification({
          type: "error",
          text: t("Failed to delete project.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully delete project!")
      });
      return { status: "success" };
    },
    [deleteProjectMutation, t, setNotification]
  );

  const [updateProjectBasicAuthMutation] = useMutation(
    UPDATE_PROJECT_BASIC_AUTH,
    {
      refetchQueries: ["GetProject"]
    }
  );
  const updateProjectBasicAuth = useCallback(
    async (input: UpdateProjectBasicAuthMutationVariables) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await updateProjectBasicAuthMutation({
        variables: { ...input }
      });

      if (errors || !data?.updateProject) {
        console.log("GraphQL: Failed to update project", errors);
        setNotification({
          type: "error",
          text: t("Failed to update project.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully updated project!")
      });
      return { data: data?.updateProject?.project, status: "success" };
    },
    [updateProjectBasicAuthMutation, t, setNotification]
  );

  const [updateProjectMetadataMutation] = useMutation(UPDATE_PROJECT_METADATA, {
    refetchQueries: ["GetProject"]
  });
  const updateProjectMetadata = useCallback(
    async (input: UpdateProjectMetadataInput) => {
      if (!input.project) return { status: "error" };

      const { data, errors } = await updateProjectMetadataMutation({
        variables: { ...input }
      });

      if (errors || !data?.updateProjectMetadata) {
        console.log("GraphQL: Failed to update project metadata", errors);
        setNotification({
          type: "error",
          text: t("Failed to update project metadata.")
        });

        return { status: "error" };
      }

      setNotification({
        type: "success",
        text: t("Successfully updated project metadata!")
      });
      return { data: data?.updateProjectMetadata?.metadata, status: "success" };
    },
    [updateProjectMetadataMutation, setNotification, t]
  );

  return {
    createProject,
    publishProject,
    updatePublishProject,
    updateProject,
    updateProjectBasicAuth,
    updateProjectRecycleBin,
    updateProjectMetadata,
    deleteProject,
    archiveProject
  };
};
