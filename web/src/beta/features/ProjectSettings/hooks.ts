import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";

import { GeneralSettingsType } from "./innerPages/GeneralSettings";
import {
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicAliasSettingsType,
} from "./innerPages/PublicSettings";
import { StorySettingsType } from "./innerPages/StorySettings";

type Props = {
  projectId: string;
  workspaceId?: string;
  fieldId?: string;
  fieldParam?: string;
};

export default ({ projectId, workspaceId, fieldId, fieldParam }: Props) => {
  const navigate = useNavigate();

  const {
    useProjectQuery,
    useUpdateProject,
    useArchiveProject,
    useDeleteProject,
    useUpdateProjectBasicAuth,
    useUpdateProjectAlias,
  } = useProjectFetcher();
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
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({ storyId: currentStory.id, sceneId: scene.id, ...settings });
    },
    [useUpdateStory, currentStory?.id, scene?.id],
  );

  // Public
  const handleUpdateStoryBasicAuth = useCallback(
    async (settings: PublicBasicAuthSettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({ storyId: currentStory.id, sceneId: scene.id, ...settings });
    },
    [useUpdateStory, currentStory?.id, scene?.id],
  );
  const handleUpdateStoryAlias = useCallback(
    async (settings: PublicAliasSettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({ storyId: currentStory.id, sceneId: scene.id, ...settings });
    },
    [useUpdateStory, currentStory?.id, scene?.id],
  );

  const handleUpdateProjectBasicAuth = useCallback(
    async (settings: PublicBasicAuthSettingsType) => {
      if (!projectId) return;
      await useUpdateProjectBasicAuth({ projectId, ...settings });
    },
    [projectId, useUpdateProjectBasicAuth],
  );

  const handleUpdateProjectAlias = useCallback(
    async (settings: PublicAliasSettingsType) => {
      if (!projectId) return;
      await useUpdateProjectAlias({ projectId, ...settings });
    },
    [projectId, useUpdateProjectAlias],
  );

  return {
    sceneId: scene?.id,
    project,
    stories,
    currentStory,
    handleUpdateProject,
    handleArchiveProject,
    handleDeleteProject,
    handleUpdateProjectBasicAuth,
    handleUpdateProjectAlias,
    handleUpdateStory,
    handleUpdateStoryBasicAuth,
    handleUpdateStoryAlias,
  };
};
