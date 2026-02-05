import { Tab } from "@reearth/app/features/Navbar";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useEditorNavigation = ({ sceneId }: { sceneId?: string }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (tab: Tab) => {
      if (!sceneId) return;
      navigate(`/scene/${sceneId}/${tab}`);
    },
    [sceneId, navigate]
  );

  return sceneId ? handleNavigate : undefined;
};

export const useSettingsNavigation = ({
  projectId
}: {
  projectId?: string;
}) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (page?: "public" | "story" | "asset" | "plugin", subId?: string) => {
      if (!projectId || !page) return;
      navigate(
        `/settings/projects/${projectId}/${page}${subId ? `/${subId}` : ""}`
      );
    },
    [projectId, navigate]
  );

  return projectId ? handleNavigate : undefined;
};
