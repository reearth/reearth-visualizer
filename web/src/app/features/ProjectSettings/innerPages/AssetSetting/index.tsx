import AssetsManager from "@reearth/app/features/AssetsManager";
import { ManagerLayout } from "@reearth/app/ui/components/ManagerBase";
import { FC, useCallback, useState } from "react";

const ASSETS_LAYOUT_STORAGE_KEY = `reearth-visualizer-project-assets-layout`;

type Props = {
  workspaceId?: string;
  projectId?: string;
};

const Assets: FC<Props> = ({ workspaceId, projectId }) => {
  const [layout, setLayout] = useState(
    ["grid", "list"].includes(
      localStorage.getItem(ASSETS_LAYOUT_STORAGE_KEY) ?? ""
    )
      ? (localStorage.getItem(ASSETS_LAYOUT_STORAGE_KEY) as ManagerLayout)
      : "grid"
  );

  const handleLayoutChange = useCallback((newLayout?: ManagerLayout) => {
    if (!newLayout) return;
    localStorage.setItem(ASSETS_LAYOUT_STORAGE_KEY, newLayout);
    setLayout(newLayout);
  }, []);

  return (
    <AssetsManager
      workspaceId={workspaceId}
      projectId={projectId}
      size="large"
      layout={layout}
      onLayoutChange={handleLayoutChange}
    />
  );
};

export default Assets;
