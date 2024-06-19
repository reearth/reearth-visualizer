import { FC, useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/common/Settings";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

import { useStoryPage } from "../context";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const PageSettingsPanel: FC<Props> = ({ showCollapseArea, areaRef }) => {
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
    <Panel
      title={t("Page Settings")}
      storageId="editor-widgets-page-settings-panel"
      extend
      alwaysOpen
      showCollapseArea={showCollapseArea}
      areaRef={areaRef}>
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
