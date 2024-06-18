import { FC, useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/common/Settings";
import { Panel } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

import { useStoryPage } from "../storyPageContext";

const PageSettingsPanel: FC = () => {
  const { selectedStoryPage, currentCamera, layers, onPageUpdate, tab, onFlyTo } = useStoryPage();

  const t = useT();

  const propertyItems = useMemo(
    () =>
      selectedStoryPage?.property.items?.filter(
        p => p.schemaGroup !== "panel" && p.schemaGroup !== "title",
      ),
    [selectedStoryPage?.property],
  );

  return (
    <Panel title={t("Page Settings")} extend>
      {selectedStoryPage && (
        <Settings
          propertyId={selectedStoryPage.property.id}
          propertyItems={propertyItems}
          currentCamera={currentCamera}
          layers={layers}
          selectedPage={selectedStoryPage}
          tab={tab}
          onPageUpdate={onPageUpdate}
          onFlyTo={onFlyTo}
        />
      )}
    </Panel>
  );
};

export default PageSettingsPanel;
