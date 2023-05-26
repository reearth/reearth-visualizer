import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export type Tab = "scene" | "story" | "widgets" | "publish";

export const useEditorNavigation = ({ sceneId }: { sceneId?: string }) => {
  const navigate = useNavigate();

  return useCallback(
    (tab: Tab) => {
      navigate(tab !== "scene" ? `/scene/${sceneId}/${tab}` : "");
    },
    [sceneId, navigate],
  );
};

export const useNavigationHooks = () => {
  return {
    useEditorNavigation,
  };
};
