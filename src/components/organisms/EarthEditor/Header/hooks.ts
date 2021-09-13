import { useNavigate } from "@reach/router";
import { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { useAuth } from "@reearth/auth";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";
import { Status } from "@reearth/components/atoms/PublicationStatus";
import { User } from "@reearth/components/molecules/EarthEditor/Header";
import { publishingType } from "@reearth/components/molecules/EarthEditor/Header/index";
import {
  useTeamsQuery,
  useGetProjectQuery,
  PublishmentStatus,
  usePublishProjectMutation,
  useCheckProjectAliasLazyQuery,
  useCreateTeamMutation,
} from "@reearth/gql";
import { useError, useSceneId, useTeam, useProject, useNotification } from "@reearth/state";

export default () => {
  const url = window.REEARTH_CONFIG?.published?.split("{}");
  const { logout } = useAuth();
  const intl = useIntl();

  const [error, setError] = useError();
  const [sceneId] = useSceneId();
  const [currentTeam, setTeam] = useTeam();
  const [currentProject, setProject] = useProject();
  const [notification, setNotification] = useNotification();

  const navigate = useNavigate();

  const [publicationModalVisible, setPublicationModalVisible] = useState(false);

  const [searchIndex, setSearchIndex] = useState(false);
  const [publishing, setPublishing] = useState<publishingType>("unpublishing");

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const openWorkspaceModal = useCallback(() => setWorkspaceModalVisible(true), []);
  const closeWorkspaceModal = useCallback(() => setWorkspaceModalVisible(false), []);

  const [projectAlias, setProjectAlias] = useState<string | undefined>();

  const { data: teamsData } = useTeamsQuery();
  const teams = teamsData?.me?.teams;

  const { data } = useGetProjectQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });
  const teamId = data?.node?.__typename === "Scene" ? data.node.teamId : undefined;
  const project = data?.node?.__typename === "Scene" ? data.node.project : undefined;

  const user: User = {
    name: teamsData?.me?.name || "",
  };

  const [validAlias, setValidAlias] = useState(false);
  const [checkProjectAliasQuery, { loading: validatingAlias, data: checkProjectAliasData }] =
    useCheckProjectAliasLazyQuery();

  const checkProjectAlias = useCallback(
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
    if (currentTeam) return;
    const team = teams?.find(t => t.id === teamId);
    if (!team) return;

    setTeam({
      id: team.id,
      name: team.name,
    });
  }, [teams, currentTeam, teamId, setTeam]);

  useEffect(() => {
    if (currentProject || !project) return;
    setProject({
      id: project.id,
      name: project.name,
    });
  }, [project, currentProject, setProject]);

  // publication modal
  useEffect(() => {
    setSearchIndex(!!(project?.publishmentStatus === "PUBLIC"));
  }, [project]);

  const onSearchIndexChange = useCallback(() => {
    setSearchIndex(!searchIndex);
  }, [searchIndex]);

  const [publishProjectMutation, { loading: publicationModalLoading }] =
    usePublishProjectMutation();

  const openPublicationModal = useCallback((p: publishingType) => {
    setPublishing(p);
    setPublicationModalVisible(true);
  }, []);
  const closePublicationModal = useCallback(() => {
    setSearchIndex(!!(project?.publishmentStatus === "PUBLIC"));
    setPublicationModalVisible(false);
  }, [project?.publishmentStatus]);

  const notify = useCallback(
    (type?: NotificationType, text?: string) => {
      if (!type || !text) return;
      setNotification({
        type: type,
        text: text,
      });
    },
    [setNotification],
  );

  const publishProject = useCallback(
    async (alias: string | undefined, s: Status) => {
      if (!project) return;
      const gqlStatus =
        s === "limited"
          ? PublishmentStatus.Limited
          : s == "published"
          ? PublishmentStatus.Public
          : PublishmentStatus.Private;
      await publishProjectMutation({
        variables: { projectId: project.id, alias, status: gqlStatus },
      });

      notify(
        s === "limited" ? "success" : s == "published" ? "success" : "info",
        s === "limited"
          ? intl.formatMessage({ defaultMessage: "Successfully published your project!" })
          : s == "published"
          ? intl.formatMessage({
              defaultMessage: "Successfully published your project with search engine indexing!",
            })
          : intl.formatMessage({ defaultMessage: "Successfully unpublished your project!" }),
      );
    },
    [project, publishProjectMutation, notify, intl],
  );

  const changeTeam = useCallback(
    (teamId: string) => {
      const team = teams?.find(team => team.id === teamId);
      if (team && teamId !== currentTeam?.id) {
        setTeam(team);
        navigate(`/dashboard/${teamId}`);
      }
    },
    [teams, currentTeam?.id, setTeam, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["teams"],
      });
      if (results.data?.createTeam) {
        setTeam(results.data.createTeam.team);
        navigate("/");
      }
    },
    [createTeamMutation, setTeam, navigate],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  const notificationTimeout = 5000;

  useEffect(() => {
    if (!error) return;
    setNotification({
      type: "error",
      text: error,
    });
    const timerID = setTimeout(() => {
      setError(undefined);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [error, setError, setNotification]);

  const closeNotification = useCallback(() => {
    if (error) {
      setError(undefined);
    }
  }, [error, setError]);

  const openPreview = useCallback(() => {
    window.open(location.pathname + "/preview", "_blank");
  }, []);

  useEffect(() => {
    if (!notification?.text) return;
    const timerID = setTimeout(() => setNotification(undefined), notificationTimeout);
    return () => clearTimeout(timerID);
  }, [notification?.text, setNotification]);

  return {
    teams,
    teamId,
    publicationModalVisible,
    searchIndex,
    onSearchIndexChange,
    publishing,
    workspaceModalVisible,
    projectId: project?.id,
    projectAlias,
    projectStatus: convertStatus(project?.publishmentStatus),
    publicationModalLoading,
    user,
    currentTeam,
    currentProject,
    notification,
    validAlias,
    validatingAlias,
    url,
    changeTeam,
    openPublicationModal,
    closePublicationModal,
    openWorkspaceModal,
    closeWorkspaceModal,
    publishProject,
    logout,
    notify,
    checkProjectAlias,
    closeNotification,
    createTeam,
    openPreview,
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
