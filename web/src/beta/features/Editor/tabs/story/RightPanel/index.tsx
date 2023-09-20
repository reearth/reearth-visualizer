import { useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId?: string;
  selectedPage?: Page;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const StoryRightPanel: React.FC<Props> = ({ selectedPage, currentCamera, onFlyTo }) => {
  const t = useT();

  const propertyItems = useMemo(
    () =>
      selectedPage?.property.items?.filter(
        p => p.schemaGroup !== "panel" && p.schemaGroup !== "title",
      ),
    [selectedPage?.property],
  );

  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: t("Page Settings"),
          children: selectedPage && (
            <Settings
              propertyId={selectedPage.property.id}
              propertyItems={propertyItems}
              currentCamera={currentCamera}
              onFlyTo={onFlyTo}
            />
          ),
        },
      ]}
    />
  );
};

export default StoryRightPanel;
