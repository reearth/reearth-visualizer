import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Status } from "@reearth/classic/components/atoms/PublicationStatus";
import { User } from "@reearth/classic/components/molecules/EarthEditor/Header";
import { publishingType } from "@reearth/classic/components/molecules/EarthEditor/Header/index";
import {
  useGetTeamsQuery,
  useGetProjectBySceneQuery,
  PublishmentStatus,
  usePublishProjectMutation,
  useCheckProjectAliasLazyQuery,
  useCreateTeamMutation,
} from "@reearth/classic/gql";
import { useAuth } from "@reearth/services/auth";
import { useT } from "@reearth/services/i18n";
import { useSceneId, useWorkspace, useProject, useNotification } from "@reearth/services/state";

export default () => {
  const url = window.REEARTH_CONFIG?.published?.split("{}");
  const { logout: handleLogout } = useAuth();
  const t = useT();

  const [, setNotification] = useNotification();
  const [sceneId] = useSceneId();
  const [currentProject, setProject] = useProject();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const navigate = useNavigate();

  const [publicationModalVisible, setPublicationModalVisible] = useState(false);

  const [searchIndex, setSearchIndex] = useState(false);
  const [publishing, setPublishing] = useState<publishingType>("unpublishing");

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalVisible(true), []);
  const handleWorkspaceModalClose = useCallback(() => setWorkspaceModalVisible(false), []);

  const [projectAlias, setProjectAlias] = useState<string | undefined>();

  const { data: WorkspacesData } = useGetTeamsQuery();
  const workspaces = WorkspacesData?.me?.teams;

  const { data } = useGetProjectBySceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const workspaceId = useMemo(
    () => (data?.node?.__typename === "Scene" ? data.node.teamId : undefined),
    [data?.node],
  );

  useEffect(() => {
    if (!currentWorkspace) {
      setCurrentWorkspace(workspaces?.find(w => w.id === workspaceId));
    }
  }, [workspaces, workspaceId, currentWorkspace, setCurrentWorkspace]);

  const project = useMemo(
    () =>
      data?.node?.__typename === "Scene" && data.node.project
        ? { ...data.node.project, sceneId: data.node.id }
        : undefined,
    [data?.node],
  );

  const user: User = {
    name: WorkspacesData?.me?.name || "",
  };

  const [validAlias, setValidAlias] = useState(false);
  const [checkProjectAliasQuery, { loading: validatingAlias, data: checkProjectAliasData }] =
    useCheckProjectAliasLazyQuery();

  const handleProjectAliasCheck = useCallback(
    (alias: string) => {
      if (project?.alias === alias) {
        setValidAlias(true);
        return;
      }
      return checkProjectAliasQuery({ variables: { alias } });
    },
    [checkProjectAliasQuery, project],
  );

  useEffect(() => {
    setValidAlias(
      !validatingAlias &&
        !!project &&
        !!checkProjectAliasData &&
        (project.alias === checkProjectAliasData.checkProjectAlias.alias ||
          checkProjectAliasData.checkProjectAlias.available),
    );
  }, [validatingAlias, checkProjectAliasData, project]);

  useEffect(() => {
    setProject(p =>
      p?.id !== project?.id
        ? project
          ? {
              id: project.id,
              name: project.name,
              sceneId: project.sceneId,
            }
          : undefined
        : p,
    );
  }, [project, setProject]);

  // publication modal
  useEffect(() => {
    setSearchIndex(!!(project?.publishmentStatus === "PUBLIC"));
  }, [project]);

  const handleSearchIndexChange = useCallback(() => {
    setSearchIndex(!searchIndex);
  }, [searchIndex]);

  const [publishProjectMutation, { loading: publicationModalLoading }] =
    usePublishProjectMutation();

  const handlePublicationModalOpen = useCallback((p: publishingType) => {
    setPublishing(p);
    setPublicationModalVisible(true);
  }, []);
  const handlePublicationModalClose = useCallback(() => {
    setSearchIndex(!!(project?.publishmentStatus === "PUBLIC"));
    setPublicationModalVisible(false);
  }, [project?.publishmentStatus]);

  const handleProjectPublish = useCallback(
    async (alias: string | undefined, s: Status) => {
      if (!project) return;
      const gqlStatus =
        s === "limited"
          ? PublishmentStatus.Limited
          : s == "published"
          ? PublishmentStatus.Public
          : PublishmentStatus.Private;
      const result = await publishProjectMutation({
        variables: { projectId: project.id, alias, status: gqlStatus },
      });

      if (result.errors) {
        setNotification({
          type: "error",
          text: t("Failed to publish your project."),
        });
      } else {
        setNotification({
          type: s === "limited" ? "success" : s == "published" ? "success" : "info",
          text:
            s === "limited"
              ? t("Successfully published your project!")
              : s == "published"
              ? t("Successfully published your project with search engine indexing!")
              : t("Successfully unpublished your project. Now nobody can access your project."),
        });
      }
    },
    [project, publishProjectMutation, t, setNotification],
  );

  const handleTeamChange = useCallback(
    (id: string) => {
      const workspace = workspaces?.find(workspace => workspace.id === id);
      if (workspace && id !== currentWorkspace?.id) {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard/${id}`);
      }
    },
    [currentWorkspace?.id, setCurrentWorkspace, workspaces, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const handleTeamCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      if (results.data?.createTeam) {
        setCurrentWorkspace(results.data.createTeam.team);
        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
    },
    [createTeamMutation, setCurrentWorkspace, navigate],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  const handlePreviewOpen = useCallback(() => {
    window.open(location.pathname + "/preview", "_blank");
  }, []);

  const handleCopyToClipBoard = useCallback(() => {
    setNotification({
      type: "info",
      text: t("Successfully copied to clipboard!"),
    });
  }, [t, setNotification]);

  return {
    workspaces,
    workspaceId,
    publicationModalVisible,
    searchIndex,
    publishing,
    workspaceModalVisible,
    projectId: project?.id,
    projectAlias,
    projectStatus: convertStatus(project?.publishmentStatus),
    publicationModalLoading,
    user,
    currentWorkspace,
    currentProject,
    validAlias,
    validatingAlias,
    url,
    handlePublicationModalOpen,
    handlePublicationModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceModalClose,
    handleSearchIndexChange,
    handleTeamChange,
    handleTeamCreate,
    handleProjectPublish,
    handleProjectAliasCheck,
    handleCopyToClipBoard,
    handlePreviewOpen,
    handleLogout,
  };
};

const convertStatus = (status?: PublishmentStatus): Status | undefined => {
  switch (status) {
    case "PUBLIC":
      return "published";
    case "LIMITED":
      return "limited";
    case "PRIVATE":
      return "unpublished";
  }
  return undefined;
};
