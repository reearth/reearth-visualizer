import { useApolloClient } from "@apollo/client";
import { useProject } from "@reearth/services/api/project";
import { useProjectMutations } from "@reearth/services/api/project/useProjectMutations";
import {
  useStories,
  useStoryMutations
} from "@reearth/services/api/storytelling";
import { toPublishmentStatus } from "@reearth/services/api/utils";
import { useAuth } from "@reearth/services/auth/useAuth";
import { config } from "@reearth/services/config";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import useScene from "../Editor/hooks/useScene";

import { GeneralSettingsType } from "./innerPages/GeneralSettings";
import {
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicAliasSettingsType,
  PublicGASettingsType,
  PublicStorySettingsType
} from "./innerPages/PublicSettings";
import { StorySettingsType } from "./innerPages/StorySettings";

import { ProjectSettingsProps } from ".";

export default ({ projectId }: ProjectSettingsProps) => {
  const navigate = useNavigate();

  const {
    updateProject,
    updateProjectBasicAuth,
    updateProjectRecycleBin,
    publishProject,
    updatePublishProject,
    updateProjectMetadata
  } = useProjectMutations();

  const { publishStory, updatePublishStory, updateStory } = useStoryMutations();

  const client = useApolloClient();

  const { project } = useProject(projectId);
  const [disabled, setDisabled] = useState(false);

  const { scene } = useScene({ sceneId: project?.scene?.id });
  const workspaceId = useMemo(() => scene?.workspaceId, [scene?.workspaceId]);

  const handleUpdateProject = useCallback(
    async (settings: GeneralSettingsType & PublicSettingsType) => {
      await updateProject({ projectId, ...settings });
    },
    [projectId, updateProject]
  );

  const unpublish = useCallback(async () => {
    const publishmentStatus = toPublishmentStatus(project?.publishmentStatus);
    if (publishmentStatus === "published" || publishmentStatus === "limited") {
      await publishProject("unpublished", projectId);
    }

    const storiesPublished = scene?.stories?.some((story) => {
      const publishmentStatus = toPublishmentStatus(story.publishmentStatus);
      return (
        publishmentStatus === "published" || publishmentStatus === "limited"
      );
    });

    if (storiesPublished && scene?.stories) {
      await Promise.all(
        scene.stories.map(async (story) => {
          const publishmentStatus = toPublishmentStatus(
            story.publishmentStatus
          );
          if (
            publishmentStatus === "published" ||
            publishmentStatus === "limited"
          ) {
            await publishStory("unpublished", story.id);
          }
        })
      );
    }
  }, [
    projectId,
    project?.publishmentStatus,
    scene?.stories,
    publishProject,
    publishStory
  ]);

  const handleProjectRemove = useCallback(async () => {
    const updatedProject = {
      projectId,
      deleted: true
    };
    setDisabled(!disabled);

    await unpublish();

    const { status } = await updateProjectRecycleBin(updatedProject);
    client.cache.evict({
      id: client.cache.identify({
        __typename: "Project",
        id: projectId
      })
    });
    client.cache.gc();
    if (status === "success") {
      navigate(`/dashboard/${workspaceId}/`);
    }
  }, [
    client.cache,
    disabled,
    unpublish,
    navigate,
    projectId,
    updateProjectRecycleBin,
    workspaceId
  ]);

  const handleUpdateProjectBasicAuth = useCallback(
    async (settings: PublicBasicAuthSettingsType) => {
      if (!projectId) return;
      await updateProjectBasicAuth({ projectId, ...settings });
    },
    [projectId, updateProjectBasicAuth]
  );

  const handleUpdateProjectAlias = useCallback(
    async (settings: PublicAliasSettingsType) => {
      if (!projectId || settings.alias === undefined) return;
      const status =
        project?.publishmentStatus === "PUBLIC" ? "published" : "limited";
      await updatePublishProject(status, projectId, settings.alias);
    },
    [project?.publishmentStatus, projectId, updatePublishProject]
  );

  const handleUpdateProjectGA = useCallback(
    async (settings: PublicGASettingsType) => {
      if (!projectId) return;
      await updateProject({ projectId, ...settings });
    },
    [projectId, updateProject]
  );
  const { stories = [] } = useStories({ sceneId: scene?.id });
  const currentStory = useMemo(
    () => (stories?.length ? stories[0] : undefined),
    [stories]
  );

  const handleUpdateStoryAlias = useCallback(
    async (settings: PublicStorySettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      const status =
        currentStory?.publishmentStatus === "PUBLIC" ? "published" : "limited";
      await updatePublishStory(status, currentStory.id, settings.alias);
    },
    [
      scene?.id,
      currentStory?.id,
      currentStory?.publishmentStatus,
      updatePublishStory
    ]
  );

  const handleUpdateStory = useCallback(
    async (settings: PublicStorySettingsType | StorySettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await updateStory({
        storyId: currentStory.id,
        sceneId: scene.id,
        ...settings
      });
    },
    [updateStory, currentStory?.id, scene?.id]
  );

  const { getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    getAccessToken().then((token) => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  const extensions = useMemo(
    () => ({
      library: config()?.extensions?.pluginLibrary,
      installed: config()?.extensions?.pluginInstalled
    }),
    []
  );

  const handleUpdateProjectMetadata = useCallback(
    async (metadata: { readme?: string; license?: string }) => {
      await updateProjectMetadata({ project: projectId, ...metadata });
    },
    [projectId, updateProjectMetadata]
  );

  return {
    sceneId: scene?.id,
    workspaceId,
    project,
    plugins: scene?.plugins,
    stories,
    currentStory,
    accessToken,
    extensions,
    disabled,
    handleUpdateProject,
    handleProjectRemove,
    handleUpdateProjectBasicAuth,
    handleUpdateProjectAlias,
    handleUpdateProjectGA,
    handleUpdateStory,
    handleUpdateStoryAlias,
    handleUpdateProjectMetadata
  };
};

export function extractPrefixSuffix(url?: string) {
  if (!url || !url.includes("{}")) return ["", ""];
  return url.split("{}");
}
