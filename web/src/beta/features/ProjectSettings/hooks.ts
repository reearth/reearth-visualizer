import { useApolloClient } from "@apollo/client";
import {
  useProjectFetcher,
  useSceneFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toPublishmentStatus } from "../Dashboard/ContentsContainer/Projects/hooks";

import { GeneralSettingsType } from "./innerPages/GeneralSettings";
import {
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicAliasSettingsType,
  PublicGASettingsType
} from "./innerPages/PublicSettings";
import { StorySettingsType } from "./innerPages/StorySettings";

type Props = {
  projectId: string;
  subId?: string;
};

export default ({ projectId }: Props) => {
  const navigate = useNavigate();

  const {
    useProjectQuery,
    useUpdateProject,
    useUpdateProjectBasicAuth,
    useUpdateProjectAlias,
    useUpdateProjectRemove,
    usePublishProject
  } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();
  const { usePublishStory } = useStorytellingFetcher();

  const client = useApolloClient();

  const { project } = useProjectQuery(projectId);
  const [disabled, setDisabled] = useState(false);

  const { scene } = useSceneQuery({ sceneId: project?.scene?.id });
  const workspaceId = useMemo(() => scene?.workspaceId, [scene?.workspaceId]);

  const handleUpdateProject = useCallback(
    async (settings: GeneralSettingsType & PublicSettingsType) => {
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject]
  );

  const projectPublished = useMemo(() => {
    const publishmentStatus = toPublishmentStatus(project?.publishmentStatus);

    return publishmentStatus === "published" || publishmentStatus === "limited";
  }, [project?.publishmentStatus]);

  const storiesPublished = useMemo(() => {
    return scene?.stories?.some((story) => {
      const publishmentStatus = toPublishmentStatus(story.publishmentStatus);
      return (
        publishmentStatus === "published" || publishmentStatus === "limited"
      );
    });
  }, [scene?.stories]);

  const handleProjectPublish = useCallback(
    async (projectId: string) => {
      if (projectPublished) {
        await usePublishProject("unpublished", projectId);
      }
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
    },
    [
      projectPublished,
      scene?.stories,
      storiesPublished,
      usePublishProject,
      usePublishStory
    ]
  );

  const handleProjectRemove = useCallback(async () => {
    const updatedProject = {
      projectId,
      deleted: true
    };
    setDisabled(!disabled);
    handleProjectPublish(projectId);
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
  }, [client.cache, disabled, handleProjectPublish, navigate, projectId, useUpdateProjectRemove, workspaceId]);

  const handleUpdateProjectBasicAuth = useCallback(
    async (settings: PublicBasicAuthSettingsType) => {
      if (!projectId) return;
      await useUpdateProjectBasicAuth({ projectId, ...settings });
    },
    [projectId, useUpdateProjectBasicAuth]
  );

  const handleUpdateProjectAlias = useCallback(
    async (settings: PublicAliasSettingsType) => {
      if (!projectId) return;
      await useUpdateProjectAlias({ projectId, ...settings });
    },
    [projectId, useUpdateProjectAlias]
  );

  const handleUpdateProjectGA = useCallback(
    async (settings: PublicGASettingsType) => {
      if (!projectId) return;
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject]
  );
  const { useStoriesQuery } = useStorytellingAPI();
  const { stories = [] } = useStoriesQuery({ sceneId: scene?.id });
  const currentStory = useMemo(
    () => (stories?.length ? stories[0] : undefined),
    [stories]
  );

  const { useUpdateStory } = useStorytellingAPI();
  const handleUpdateStory = useCallback(
    async (settings: PublicSettingsType & StorySettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({
        storyId: currentStory.id,
        sceneId: scene.id,
        ...settings
      });
    },
    [useUpdateStory, currentStory?.id, scene?.id]
  );

  const handleUpdateStoryBasicAuth = useCallback(
    async (settings: PublicBasicAuthSettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({
        storyId: currentStory.id,
        sceneId: scene.id,
        ...settings
      });
    },
    [useUpdateStory, currentStory?.id, scene?.id]
  );
  const handleUpdateStoryAlias = useCallback(
    async (settings: PublicAliasSettingsType) => {
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
    handleUpdateStoryBasicAuth,
    handleUpdateStoryAlias
  };
};
