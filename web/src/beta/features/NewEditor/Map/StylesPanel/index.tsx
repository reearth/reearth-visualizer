import { FC } from "react";

import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

const StylesPanel: FC = () => {
  const t = useT();

  return <Panel title={t("Layer Style")} extend alwaysOpen storageId="editor-map-scene-panel" />;
};

export default StylesPanel;
