import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth/auth";
import { Status } from "@reearth/components/atoms/PublicationStatus";
import { User } from "@reearth/components/molecules/EarthEditor/Header";
import { publishingType } from "@reearth/components/molecules/EarthEditor/Header/index";
import {
  useGetTeamsQuery,
  useGetProjectBySceneQuery,
  PublishmentStatus,
  usePublishProjectMutation,
  useCheckProjectAliasLazyQuery,
  useCreateTeamMutation,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useSceneId, useWorkspace, useProject, useNotification } from "@reearth/state";

export default () => {
  const url = window.REEARTH_CONFIG?.published?.split("{}");
  const { logout: handleLogout } = useAuth();
  const t = useT();

  const [, setNotification] = useNotification();
  const [sceneId] = useSceneId();
  const [currentWorkspace, setWorkspace] = useWorkspace();
  const [currentProject, setProject] = useProject();

  const navigate = useNavigate();

  const [publicationModalVisible, setPublicationModalVisible] = useState(false);

  const [searchIndex, setSearchIndex] = useState(false);
  const [publishing, setPublishing] = useState<publishingType>("unpublishing");

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalVisible(true), []);
  const handleWorkspaceModalClose = useCallback(() => setWorkspaceModalVisible(false), []);

  const [projectAlias, setProjectAlias] = useState<string | undefined>();

  const { data: teamsData } = useGetTeamsQuery();
  const teams = teamsData?.me?.teams;

  const { data } = useGetProjectBySceneQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });
  const teamId = data?.node?.__typename === "Scene" ? data.node.teamId : undefined;
  const project = useMemo(
    () =>
      data?.node?.__typename === "Scene" && data.node.project
        ? { ...data.node.project, sceneId: data.node.id }
        : undefined,
    [data?.node],
  );

  const user: User = {
    name: teamsData?.me?.name || "",
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
    if (currentWorkspace) return;
    const team = teams?.find(t => t.id === teamId);
    if (!team) return;
    setWorkspace(team);
  }, [teams, currentWorkspace, teamId, setWorkspace]);

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
    (teamId: string) => {
      const team = teams?.find(team => team.id === teamId);
      if (team && teamId !== currentWorkspace?.id) {
        setWorkspace(team);
        navigate(`/dashboard/${teamId}`);
      }
    },
    [teams, currentWorkspace?.id, setWorkspace, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const handleTeamCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      if (results.data?.createTeam) {
        setWorkspace(results.data.createTeam.team);
        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
    },
    [createTeamMutation, setWorkspace, navigate],
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
    teams,
    teamId,
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
