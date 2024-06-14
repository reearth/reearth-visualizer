import { FC } from "react";

import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

const LayersPanel: FC = () => {
  const t = useT();

  return <Panel title={t("Layers")} storageId="editor-map-layers-panel" extend />;
};

export default LayersPanel;
