import { FC } from "react";

import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

const ScenePanel: FC = () => {
  const t = useT();

  return <Panel title={t("Scene")} storageId="editor-map-scene-panel" />;
};

export default ScenePanel;
