import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export type Tab = "scene" | "story" | "widgets" | "publish";

export const useNavbarHooks = ({ sceneId }: { sceneId?: string }) => {
  const navigate = useNavigate();

  const handleEditorNavigation = useCallback(
    (tab: Tab) => {
      navigate(tab !== "scene" ? `/scene/${sceneId}/${tab}` : "");
    },
    [sceneId, navigate],
  );

  return {
    handleEditorNavigation,
  };
};
