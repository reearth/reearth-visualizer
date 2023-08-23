import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectFetcher } from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { StoryFragmentFragment } from "@reearth/services/gql";

type Props = {
  projectId: string;
  sceneId?: string;
  workspaceId?: string;
  fieldId?: string;
  fieldParam?: string;
  stories: StoryFragmentFragment[];
};
export default ({ projectId, sceneId, workspaceId, fieldId, fieldParam, stories }: Props) => {
  const navigate = useNavigate();

  // Project
  const { useProjectQuery, useUpdateProject, useArchiveProject, useDeleteProject } =
    useProjectFetcher();

  const { project } = useProjectQuery(projectId);

  const handleUpdateProject = useCallback(
    async ({ name }: { name: string }) => {
      await useUpdateProject({ projectId, name });
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
  const currentStory = useMemo(
    () =>
      fieldId === "story" || fieldId === "public"
        ? stories.find(s => s.id === fieldParam)
        : undefined,
    [fieldId, fieldParam, stories],
  );

  const { useUpdateStory } = useStorytellingAPI();
  const handleUpdateStory = useCallback(async () => {
    if (!sceneId || !currentStory?.id) return;
    await useUpdateStory({ storyId: currentStory.id, sceneId });
  }, [useUpdateStory, sceneId, currentStory?.id]);

  // Public

  return {
    project,
    currentStory,
    handleUpdateProject,
    handleArchiveProject,
    handleDeleteProject,
    handleUpdateStory,
  };
};
