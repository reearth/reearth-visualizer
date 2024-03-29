import { useCallback, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectFetcher, useSceneFetcher } from "@reearth/services/api";
import useStorytellingAPI from "@reearth/services/api/storytellingApi";
import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";

import { GeneralSettingsType } from "./innerPages/GeneralSettings";
import {
  PublicBasicAuthSettingsType,
  PublicSettingsType,
  PublicAliasSettingsType,
  PublicGASettingsType,
} from "./innerPages/PublicSettings";
import { StorySettingsType } from "./innerPages/StorySettings";

import { projectSettingsTab } from ".";

type Props = {
  projectId: string;
  tab?: projectSettingsTab;
  subId?: string;
};

export default ({ projectId, tab }: Props) => {
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

  const workspaceId = useMemo(() => scene?.workspaceId, [scene?.workspaceId]);

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

  const handleUpdateProjectGA = useCallback(
    async (settings: PublicGASettingsType) => {
      if (!projectId) return;
      await useUpdateProject({ projectId, ...settings });
    },
    [projectId, useUpdateProject],
  );
  const { useStoriesQuery } = useStorytellingAPI();
  const { stories = [] } = useStoriesQuery({ sceneId: scene?.id });
  const currentStory = useMemo(() => (stories?.length ? stories[0] : undefined), [stories]);

  const { useUpdateStory } = useStorytellingAPI();
  const handleUpdateStory = useCallback(
    async (settings: PublicSettingsType & StorySettingsType) => {
      if (!scene?.id || !currentStory?.id) return;
      await useUpdateStory({ storyId: currentStory.id, sceneId: scene.id, ...settings });
    },
    [useUpdateStory, currentStory?.id, scene?.id],
  );

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

  const { getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  const extensions = useMemo(
    () => ({
      library: config()?.extensions?.pluginLibrary,
      installed: config()?.extensions?.pluginInstalled,
    }),
    [],
  );

  // Redirection for classic projects
  useEffect(() => {
    if (!project) return;
    if (!project.coreSupport) {
      switch (tab) {
        case "general":
          navigate(`/settings/projects/${projectId}`);
          break;
        case "public":
          navigate(`/settings/projects/${projectId}/public`);
          break;
        case "asset":
          navigate(`/settings/workspaces/${workspaceId}/asset`);
          break;
        case "plugins":
          navigate(`/settings/projects/${projectId}/plugins`);
          break;
        default:
          navigate(`/settings/projects/${projectId}`);
      }
    }
  }, [project, projectId, tab, workspaceId, navigate]);

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
    handleArchiveProject,
    handleDeleteProject,
    handleUpdateProjectBasicAuth,
    handleUpdateProjectAlias,
    handleUpdateProjectGA,
    handleUpdateStory,
    handleUpdateStoryBasicAuth,
    handleUpdateStoryAlias,
  };
};
