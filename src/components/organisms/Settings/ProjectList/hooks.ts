import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "@reach/router";

import {
  useMeQuery,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  Visualizer,
  useAssetsQuery,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";
import { Project } from "@reearth/components/molecules/Dashboard/types";
import { AssetNodes } from "@reearth/components/organisms/EarthEditor/PropertyPane/hooks-queries";

const toPublishmentStatus = (s: PublishmentStatus) =>
  s === PublishmentStatus.Public
    ? "published"
    : s === PublishmentStatus.Limited
    ? "limited"
    : "unpublished";

export default () => {
  const [currentTeam, setLocalState] = useLocalState(s => s.currentTeam);
  const navigate = useNavigate();

  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useMeQuery();
  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["Project"],
  });
  const [createScene] = useCreateSceneMutation();

  const teamId = currentTeam?.id;
  const team = teamId ? data?.me?.teams.find(team => team.id === teamId) : data?.me?.myTeam;

  useEffect(() => {
    if (team?.id && !currentTeam?.id) {
      setLocalState({ currentTeam: team });
    }
  }, [currentTeam, team, setLocalState]);

  const currentProjects = (team?.projects.nodes ?? [])
    .map<Project | undefined>(project =>
      project
        ? {
            id: project.id,
            description: project.description,
            name: project.name,
            imageUrl: project.imageUrl,
            isArchived: project.isArchived,
            status: toPublishmentStatus(project.publishmentStatus),
            sceneId: project.scene?.id,
          }
        : undefined,
    )
    .filter((project): project is Project => !!project && project?.isArchived === false);

  const archivedProjects = (team?.projects.nodes ?? [])
    .map<Project | undefined>(project =>
      project
        ? {
            id: project.id,
            description: project.description,
            name: project.name,
            imageUrl: project.imageUrl,
            isArchived: project.isArchived,
            status: toPublishmentStatus(project.publishmentStatus),
            sceneId: project.scene?.id,
          }
        : undefined,
    )
    .filter((project): project is Project => !!project && project?.isArchived === true);

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  // Submit Form
  const createProject = useCallback(
    async (data: { name: string; description: string }) => {
      if (!teamId) return;
      const project = await createNewProject({
        variables: {
          teamId,
          visualizer: Visualizer.Cesium,
          name: data.name,
          description: data.description,
        },
      });
      if (project.errors || !project.data) {
        throw new Error("プロジェクトの作成に失敗しました。");
      }
      const scene = await createScene({
        variables: { projectId: project.data.createProject.project.id },
      });
      if (scene.errors || !scene.data) {
        throw new Error("プロジェクトの作成に失敗しました。");
      }
      setModalShown(false);
    },
    [createNewProject, createScene, teamId],
  );

  const selectProject = useCallback(
    (project: Project) => {
      if (project.id) {
        setLocalState({ currentProject: project });
        navigate(`/settings/project/${project.id}`);
      }
    },
    [navigate, setLocalState],
  );

  const { data: assetsData } = useAssetsQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });
  const assets = assetsData?.assets.nodes.filter(Boolean) as AssetNodes;

  return {
    currentProjects,
    archivedProjects,
    teamId,
    loading,
    modalShown,
    openModal,
    handleModalClose,
    createProject,
    selectProject,
    assets,
  };
};
