import { FC } from "react";

import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

const SceneInspectorPanel: FC = () => {
  const t = useT();

  return (
    <Panel title={t("Scene Inspector")} storageId="editor-map-scene-inspector-panel" alwaysOpen />
  );
};

export default SceneInspectorPanel;
