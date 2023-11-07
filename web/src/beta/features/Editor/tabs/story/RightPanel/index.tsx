import { useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { Tab } from "@reearth/beta/features/Navbar";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { Page } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId?: string;
  selectedPage?: Page;
  currentCamera?: Camera;
  layers?: NLSLayer[];
  tab?: Tab;
  onFlyTo?: FlyTo;
  onPageUpdate?: (id: string, layers: string[]) => void;
};

const StoryRightPanel: React.FC<Props> = ({
  selectedPage,
  currentCamera,
  layers,
  onPageUpdate,
  tab,
  onFlyTo,
}) => {
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
              layers={layers}
              selectedPage={selectedPage}
              tab={tab}
              onPageUpdate={onPageUpdate}
              onFlyTo={onFlyTo}
            />
          ),
        },
      ]}
    />
  );
};

export default StoryRightPanel;
