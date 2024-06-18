import { FC } from "react";

import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

import { useWidgetsPage } from "../context";

import useHooks from "./hooks";
import Settings from "./Settings";

const WidgetInspectorPanel: FC = () => {
  const t = useT();

  const { sceneId, selectedWidget, currentCamera, onFlyTo } = useWidgetsPage();

  const { propertyItems } = useHooks({ sceneId, selectedWidget });

  return (
    <Panel title={t("Inspector")} extend alwaysOpen>
      {selectedWidget && (
        <Settings
          id={selectedWidget.propertyId}
          propertyItems={propertyItems}
          currentCamera={currentCamera}
          onFlyTo={onFlyTo}
        />
      )}
    </Panel>
  );
};

export default WidgetInspectorPanel;
