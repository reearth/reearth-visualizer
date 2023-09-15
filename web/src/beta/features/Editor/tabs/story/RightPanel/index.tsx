import { useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import type { GQLStoryPage } from "@reearth/beta/lib/core/StoryPanel/hooks";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId?: string;
  selectedPage?: GQLStoryPage;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const StoryRightPanel: React.FC<Props> = ({ selectedPage, currentCamera, onFlyTo }) => {
  const t = useT();

  const propertyItems = useMemo(
    () =>
      convert(selectedPage?.property)?.filter(
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
              propertyId={selectedPage.propertyId}
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
