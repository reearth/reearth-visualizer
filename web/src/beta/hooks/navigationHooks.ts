import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Tab } from "@reearth/beta/features/Navbar";

export const useEditorNavigation = ({ sceneId }: { sceneId: string }) => {
  const navigate = useNavigate();

  return useCallback(
    (tab: Tab) => {
      navigate(`/scene/${sceneId}/${tab}`);
    },
    [sceneId, navigate],
  );
};
