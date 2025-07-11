import { useApolloClient } from "@apollo/client";
import {
  useProjectFetcher,
  useSceneFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import { toPublishmentStatus } from "@reearth/services/api/publishTypes";
import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    useProjectQuery,
    useUpdateProject,
    useUpdateProjectBasicAuth,
    useUpdateProjectRemove,
    usePublishProject,
    useUpdatePublishProject,
    useUpdateProjectMetadata
  } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();
  const {
    usePublishStory,
    useUpdatePublishStory,
    useStoriesQuery,
    useUpdateStory
  } = useStorytellingFetcher();

  const client = useApolloClient();

  const { project } = useProjectQuery(projectId);
  const [disabled, setDisabled] = useState(false);

  const { scene } = useSceneQuery({ sceneId: project?.scene?.id });
  const workspaceId = useMemo(() => scene?.workspaceId, [scene?.workspaceId]);

  const handleUpdateProject = useCallback(
    async (
      settings: GeneralSettingsType & PublicSettingsType
    ) => {
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject]
  );

  const unpublish = useCallback(async () => {
    const publishmentStatus = toPublishmentStatus(project?.publishmentStatus);
    if (publishmentStatus === "published" || publishmentStatus === "limited") {
      await usePublishProject("unpublished", projectId);
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
            await usePublishStory("unpublished", story.id);
          }
        })
      );
    }
  }, [
    projectId,
    project?.publishmentStatus,
    scene?.stories,
    usePublishProject,
    usePublishStory
  ]);

  const handleProjectRemove = useCallback(async () => {
    const updatedProject = {
      projectId,
      deleted: true
    };
    setDisabled(!disabled);

    await unpublish();

    const { status } = await useUpdateProjectRemove(updatedProject);
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
    useUpdateProjectRemove,
    workspaceId
  ]);

  const handleUpdateProjectBasicAuth = useCallback(
    async (settings: PublicBasicAuthSettingsType) => {
      if (!projectId) return;
      await useUpdateProjectBasicAuth({ projectId, ...settings });
    },
    [projectId, useUpdateProjectBasicAuth]
  );

  const handleUpdateProjectAlias = useCallback(
    async (settings: PublicAliasSettingsType) => {
      if (!projectId || settings.alias === undefined) return;
      const status =
        project?.publishmentStatus === "PUBLIC" ? "published" : "limited";
      await useUpdatePublishProject(status, projectId, settings.alias);
    },
    [project?.publishmentStatus, projectId, useUpdatePublishProject]
  );

  const handleUpdateProjectGA = useCallback(
    async (settings: PublicGASettingsType) => {
      if (!projectId) return;
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject]
  );
  const { stories = [] } = useStoriesQuery({ sceneId: scene?.id });
  const currentStory = useMemo(
    () => (stories?.length ? stories[0] : undefined),
    [stories]
  );

  const handleUpdateStoryAlias = useCallback(
    async (settings: PublicStorySettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      const status =
        currentStory?.publishmentStatus === "PUBLIC" ? "published" : "limited";
      await useUpdatePublishStory(status, currentStory.id, settings.alias);
    },
    [
      scene?.id,
      currentStory?.id,
      currentStory?.publishmentStatus,
      useUpdatePublishStory
    ]
  );

  const handleUpdateStory = useCallback(
    async (settings: PublicStorySettingsType | StorySettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({
        storyId: currentStory.id,
        sceneId: scene.id,
        ...settings
      });
    },
    [useUpdateStory, currentStory?.id, scene?.id]
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
    async (
      metadata: {
        readme?: string;
        license?: string;
      } 
    ) => {
      await useUpdateProjectMetadata({ project: projectId, ...metadata });
    },
    [projectId, useUpdateProjectMetadata]
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
