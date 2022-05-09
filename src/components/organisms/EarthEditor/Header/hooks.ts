import { useNavigate } from "@reach/router";
import { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { useAuth } from "@reearth/auth";
import { Status } from "@reearth/components/atoms/PublicationStatus";
import { User } from "@reearth/components/molecules/EarthEditor/Header";
import { publishingType } from "@reearth/components/molecules/EarthEditor/Header/index";
import {
  useGetTeamsQuery,
  useGetProjectQuery,
  PublishmentStatus,
  usePublishProjectMutation,
  useCheckProjectAliasLazyQuery,
  useCreateTeamMutation,
} from "@reearth/gql";
import { useSceneId, useTeam, useProject, useNotification } from "@reearth/state";

export default () => {
  const url = window.REEARTH_CONFIG?.published?.split("{}");
  const { logout } = useAuth();
  const intl = useIntl();

  const [, setNotification] = useNotification();
  const [sceneId] = useSceneId();
  const [currentTeam, setTeam] = useTeam();
  const [currentProject, setProject] = useProject();

  const navigate = useNavigate();

  const [publicationModalVisible, setPublicationModalVisible] = useState(false);

  const [searchIndex, setSearchIndex] = useState(false);
  const [publishing, setPublishing] = useState<publishingType>("unpublishing");

  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const openWorkspaceModal = useCallback(() => setWorkspaceModalVisible(true), []);
  const closeWorkspaceModal = useCallback(() => setWorkspaceModalVisible(false), []);

  const [projectAlias, setProjectAlias] = useState<string | undefined>();

  const { data: teamsData } = useGetTeamsQuery();
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

    setTeam(team);
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

  const publishProject = useCallback(
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
          text: intl.formatMessage({ defaultMessage: "Failed to publish your project." }),
        });
      } else {
        setNotification({
          type: s === "limited" ? "success" : s == "published" ? "success" : "info",
          text:
            s === "limited"
              ? intl.formatMessage({ defaultMessage: "Successfully published your project!" })
              : s == "published"
              ? intl.formatMessage({
                  defaultMessage:
                    "Successfully published your project with search engine indexing!",
                })
              : intl.formatMessage({
                  defaultMessage:
                    "Successfully unpublished your project. Now nobody can access your project.",
                }),
        });
      }
    },
    [project, publishProjectMutation, intl, setNotification],
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
        navigate(`/dashboard/${results.data.createTeam.team.id}`);
      }
    },
    [createTeamMutation, setTeam, navigate],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  const openPreview = useCallback(() => {
    window.open(location.pathname + "/preview", "_blank");
  }, []);

  const handleCopyToClipBoard = useCallback(() => {
    setNotification({
      type: "info",
      text: intl.formatMessage({ defaultMessage: "Successfully copied to clipboard!" }),
    });
  }, [intl, setNotification]);

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
    validAlias,
    validatingAlias,
    url,
    changeTeam,
    openPublicationModal,
    closePublicationModal,
    openWorkspaceModal,
    closeWorkspaceModal,
    handleCopyToClipBoard,
    publishProject,
    logout,
    checkProjectAlias,
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
