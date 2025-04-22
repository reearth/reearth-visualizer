import {
  Reference,
  StoreObject,
  useLazyQuery,
  useMutation,
  useQuery
} from "@apollo/client";
import { GetProjectsQueryVariables } from "@reearth/services/gql";
import {
  UpdateProjectInput,
  ProjectPayload,
  Visualizer,
  DeleteProjectInput,
  ArchiveProjectMutationVariables,
  UpdateProjectBasicAuthMutationVariables,
  UpdateProjectAliasMutationVariables
} from "@reearth/services/gql/__gen__/graphql";
import {
  ARCHIVE_PROJECT,
  CHECK_PROJECT_ALIAS,
  CREATE_PROJECT,
  DELETE_PROJECT,
  GET_PROJECT,
  GET_PROJECTS,
  GET_STARRED_PROJECTS,
  PUBLISH_PROJECT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_ALIAS,
  UPDATE_PROJECT_BASIC_AUTH,
  EXPORT_PROJECT,
  GET_DELETED_PROJECTS
} from "@reearth/services/gql/queries/project";
import { CREATE_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { useStorytellingFetcher } from "..";
import { useRestful } from "../../restful";
import { useNotification } from "../../state";
import { type PublishStatus } from "../publishTypes";
import { toGqlStatus } from "../publishTypes";
import { MutationReturn } from "../types";

export type Project = ProjectPayload["project"];
const CHUNK_SIZE = 16 * 1024 * 1024; // 16MB

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();
  const { axios } = useRestful();

  const useProjectQuery = useCallback((projectId?: string) => {
    const { data, ...rest } = useQuery(GET_PROJECT, {
      variables: { projectId: projectId ?? "" },
      skip: !projectId
    });

    const project = useMemo(
      () => (data?.node?.__typename === "Project" ? data.node : undefined),
      [data?.node]
    );

    return { project, ...rest };
  }, []);

  const useProjectsQuery = useCallback((input: GetProjectsQueryVariables) => {
    const { data, networkStatus, ...rest } = useQuery(GET_PROJECTS, {
      variables: input,
      skip: !input.teamId,
      notifyOnNetworkStatusChange: true
    });

    const projects = useMemo(
      () => data?.projects?.edges.map((e) => e.node),
      [data?.projects]
    );

    const hasMoreProjects = useMemo(
      () =>
        data?.projects.pageInfo?.hasNextPage ||
        data?.projects.pageInfo?.hasPreviousPage,
      [
        data?.projects.pageInfo?.hasNextPage,
        data?.projects.pageInfo?.hasPreviousPage
      ]
    );
    const isRefetching = useMemo(() => networkStatus < 7, [networkStatus]);
    const endCursor = useMemo(
      () => data?.projects.pageInfo?.endCursor,
      [data?.projects.pageInfo?.endCursor]
    );

    return { projects, hasMoreProjects, isRefetching, endCursor, ...rest };
  }, []);

  const useStarredProjectsQuery = useCallback((teamId?: string) => {
    const { data, ...rest } = useQuery(GET_STARRED_PROJECTS, {
      variables: { teamId: teamId ?? "" },
      skip: !teamId
    });

    const starredProjects = useMemo(
      () => data?.starredProjects.nodes,
      [data?.starredProjects]
    );

    return { starredProjects, ...rest };
  }, []);

  const useDeletedProjectsQuery = useCallback((teamId?: string) => {
    const { data, ...rest } = useQuery(GET_DELETED_PROJECTS, {
      variables: { teamId: teamId ?? "" },
      skip: !teamId
    });

    const deletedProjects = useMemo(
      () => data?.deletedProjects.nodes,
      [data?.deletedProjects]
    );

    return { deletedProjects, ...rest };
  }, []);

  const [fetchCheckAlias] = useLazyQuery(CHECK_PROJECT_ALIAS);

  const checkAlias = useCallback(
    async (alias?: string) => {
      if (!alias) return null;

      const { data, error } = await fetchCheckAlias({
        variables: { alias }
      });
      
      if (error || !data?.checkProjectAlias) {
        return { status: "error", error };
      }

      setNotification({
        type: "success",
        text: t("Successfully checked alias!")
      });
      return {
        available: data?.checkProjectAlias.available,
        alias: data?.checkProjectAlias.alias,
        status: "success"
      };
    },
    [fetchCheckAlias, setNotification, t]
  );

  const [createNewProject] = useMutation(CREATE_PROJECT);
  const [createScene] = useMutation(CREATE_SCENE, {
    refetchQueries: ["GetProjects"]
  });
  const { useCreateStory, useCreateStoryPage } = useStorytellingFetcher();

  const useCreateProject = useCallback(
    async (
      workspaceId: string,
      visualizer: Visualizer,
      name: string,
      coreSupport: boolean,
      description?: string
    ): Promise<MutationReturn<Partial<Project>>> => {
      const { data: projectResults, errors: projectErrors } =
        await createNewProject({
          variables: {
            teamId: workspaceId,
            visualizer,
            name,
            description: description ?? "",
            coreSupport: !!coreSupport
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

      const { data: storyResult, errors: storyErrors } = await useCreateStory({
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
        const { errors: storyPageErrors } = await useCreateStoryPage({
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
      useCreateStory,
      t,
      setNotification,
      useCreateStoryPage
    ]
  );

  const [publishProjectMutation, { loading: publishProjectLoading }] =
    useMutation(PUBLISH_PROJECT, {
      refetchQueries: ["GetProject"]
    });

  const usePublishProject = useCallback(
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

  const [updateProjectMutation] = useMutation(UPDATE_PROJECT, {
    refetchQueries: ["GetProject", "GetStarredProjects"]
  });
  const useUpdateProject = useCallback(
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
  const useUpdateProjectRemove = useCallback(
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
  const useArchiveProject = useCallback(
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

  const useDeleteProject = useCallback(
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
  const useUpdateProjectBasicAuth = useCallback(
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

  const [updateProjectAliasMutation] = useMutation(UPDATE_PROJECT_ALIAS);
  const useUpdateProjectAlias = useCallback(
    async (input: UpdateProjectAliasMutationVariables) => {
      if (!input.projectId) return { status: "error" };
      const { data, errors } = await updateProjectAliasMutation({
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
    [updateProjectAliasMutation, t, setNotification]
  );

  const [exportProjectMutation] = useMutation(EXPORT_PROJECT);

  const getBackendUrl = useCallback(() => {
    const apiUrl = window.REEARTH_CONFIG?.api;
    return apiUrl?.replace(/\/api$/, "");
  }, []);

  const useExportProject = useCallback(
    async (projectId: string) => {
      if (!projectId) return { status: "error" };

      try {
        const { data, errors } = await exportProjectMutation({
          variables: { projectId },
          context: {
            fetchOptions: {
              __timeout: 1000 * 60 * 30 // 30 minutes
            }
          }
        });

        if (errors || !data?.exportProject?.projectDataPath) {
          console.log("GraphQL: Failed to export project", errors);
          setNotification({
            type: "error",
            text: t("Failed to export project.")
          });

          return { status: "error" };
        }

        const projectDataPath = data.exportProject.projectDataPath;

        const backendUrl = getBackendUrl();
        const downloadUrl = `${backendUrl}${projectDataPath}`;

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${projectId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setNotification({
          type: "success",
          text: t("Successfully exported project!")
        });

        return { status: "success" };
      } catch (error) {
        console.log("GraphQL: Failed to export project", error);
        setNotification({
          type: "error",
          text: t("Failed to export project.")
        });
        return { status: "error" };
      }
    },
    [exportProjectMutation, t, setNotification, getBackendUrl]
  );

  const useImportProject = useCallback(
    async (file: File, teamId: string) => {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileId = uuidv4();
      let lastResponse = null;

      for (let chunkNum = 0; chunkNum < totalChunks; chunkNum++) {
        const start = chunkNum * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk, `${file.name}.part${chunkNum}`);
        formData.append("file_id", fileId);
        formData.append("team_id", teamId);
        formData.append("chunk_num", chunkNum.toString());
        formData.append("total_chunks", totalChunks.toString());

        try {
          const response = await axios.post("/split-import", formData);
          lastResponse = response.data;
        } catch (error) {
          setNotification({
            type: "error",
            text: t("Failed to import project.")
          });
          console.log("Restful: Failed to import project", error);
          return { status: "error" };
        }
      }

      setNotification({
        type: "success",
        text: t("Successfully imported project!")
      });
      return lastResponse || { status: "chunk_received" };
    },
    [axios, setNotification, t]
  );

  return {
    publishProjectLoading,
    useProjectQuery,
    useProjectsQuery,
    checkAlias,
    useCreateProject,
    usePublishProject,
    useUpdateProject,
    useArchiveProject,
    useDeleteProject,
    useUpdateProjectBasicAuth,
    useUpdateProjectAlias,
    useStarredProjectsQuery,
    useExportProject,
    useUpdateProjectRemove,
    useDeletedProjectsQuery,
    useImportProject
  };
};
