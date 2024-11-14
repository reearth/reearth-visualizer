import AssetsManager from "@reearth/beta/features/AssetsManager";
import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";
import { FC, useCallback, useState } from "react";

const ASSETS_LAYOUT_STORAGE_KEY = `reearth-visualizer-dashboard-assets-layout`;

type Props = {
  workspaceId: string;
};

const Assets: FC<Props> = ({ workspaceId }) => {
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
      size="large"
      layout={layout}
      onLayoutChange={handleLayoutChange}
    />
  );
};

export default Assets;
