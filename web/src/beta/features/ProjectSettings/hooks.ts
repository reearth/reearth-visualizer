import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";

import { GeneralSettingsType } from "./innerPages/GeneralSettings";
import { PublicSettingsType } from "./innerPages/PublicSettings";
import { StorySettingsType } from "./innerPages/StorySettings";

type Props = {
  projectId: string;
  sceneId?: string;
  workspaceId?: string;
  fieldId?: string;
  fieldParam?: string;
};

export default ({ projectId, sceneId, workspaceId, fieldId, fieldParam }: Props) => {
  const navigate = useNavigate();

  const { useProjectQuery, useUpdateProject, useArchiveProject, useDeleteProject } =
    useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();

  const { project } = useProjectQuery(projectId);
  const { scene } = useSceneQuery({ sceneId: project?.scene?.id });

  const handleUpdateProject = useCallback(
    async (settings: GeneralSettingsType & PublicSettingsType) => {
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject],
  );

  const handleArchiveProject = useCallback(
    async (archived: boolean) => {
      const { status } = await useArchiveProject({ projectId, archived });
      if (status === "success") {
        navigate(`/settings/workspaces/${workspaceId}/projects`);
      }
    },
    [workspaceId, projectId, useArchiveProject, navigate],
  );

  const handleDeleteProject = useCallback(async () => {
    const { status } = await useDeleteProject({ projectId });
    if (status === "success") {
      navigate(`/settings/workspaces/${workspaceId}/projects`);
    }
  }, [workspaceId, projectId, useDeleteProject, navigate]);

  // Story
  const stories = useMemo(() => scene?.stories ?? [], [scene?.stories]);
  const currentStory = useMemo(
    () =>
      fieldId === "story"
        ? stories.find(s => s.id === fieldParam) ?? stories[0]
        : fieldId === "public"
        ? stories.find(s => s.id === fieldParam)
        : undefined,
    [fieldId, fieldParam, stories],
  );

  const { useUpdateStory } = useStorytellingAPI();
  const handleUpdateStory = useCallback(
    async (settings: PublicSettingsType & StorySettingsType) => {
      if (!sceneId || !currentStory?.id) return;
      await useUpdateStory({ storyId: currentStory.id, sceneId, ...settings });
    },
    [useUpdateStory, sceneId, currentStory?.id],
  );

  // Public

  return {
    project,
    stories,
    currentStory,
    handleUpdateProject,
    handleArchiveProject,
    handleDeleteProject,
    handleUpdateStory,
  };
};
