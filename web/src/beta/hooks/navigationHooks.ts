import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export type Tab = "scene" | "story" | "widgets" | "publish";

export const useEditorNavigation = ({ sceneId }: { sceneId: string }) => {
  const navigate = useNavigate();

  return useCallback(
    (tab: Tab) => {
      navigate(`/scene/${sceneId}/${tab}`);
    },
    [sceneId, navigate],
  );
};
