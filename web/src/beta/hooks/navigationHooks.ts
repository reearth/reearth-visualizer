import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Tab } from "@reearth/beta/features/Navbar";

export const useEditorNavigation = ({
  sceneId,
  onTabChange,
}: {
  sceneId?: string;
  onTabChange?: () => void;
}) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (tab: Tab) => {
      if (!sceneId) return;
      onTabChange?.();
      navigate(`/scene/${sceneId}/${tab}`);
    },
    [sceneId, onTabChange, navigate],
  );

  return sceneId ? handleNavigate : undefined;
};

export const useSettingsNavigation = ({ projectId }: { projectId?: string }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (page?: "public" | "story" | "asset" | "plugin") => {
      if (!projectId || !page) return;
      navigate(`/settings/project/${projectId}/${page}`);
    },
    [projectId, navigate],
  );

  return projectId ? handleNavigate : undefined;
};
