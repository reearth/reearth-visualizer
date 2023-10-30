import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Tab } from "@reearth/beta/features/Navbar";

export const useEditorNavigation = ({ sceneId }: { sceneId?: string }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (tab: Tab) => {
      navigate(`/scene/${sceneId}/${tab}`);
    },
    [sceneId, navigate],
  );

  return sceneId ? handleNavigate : undefined;
};

export const useSettingsNavigation = ({ projectId }: { projectId?: string }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (page?: "public" | "story" | "asset" | "plugin") => {
      navigate(`/settings/project/${projectId}/${page}`);
    },
    [projectId, navigate],
  );

  return projectId ? handleNavigate : undefined;
};
