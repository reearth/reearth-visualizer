import { useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    useUpdateProjectRecycleBin
  } = useProjectFetcher();
  const { useSceneQuery } = useSceneFetcher();

  const { project } = useProjectQuery(projectId);

  const { scene } = useSceneQuery({ sceneId: project?.scene?.id });

  const workspaceId = useMemo(() => scene?.workspaceId, [scene?.workspaceId]);

  const handleUpdateProject = useCallback(
    async (settings: GeneralSettingsType & PublicSettingsType) => {
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject]
  );

  const handleProjectRemove= useCallback(async () => {
    const updatedProject = {
      projectId,
      deleted: !project?.isDeleted
    };

    const { status } = await useUpdateProjectRecycleBin(updatedProject);
    if (status === "success") {
      navigate(`/dashboard/${workspaceId}/`);
    }
  }, [
    navigate,
    project?.isDeleted,
    projectId,
    useUpdateProjectRecycleBin,
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
