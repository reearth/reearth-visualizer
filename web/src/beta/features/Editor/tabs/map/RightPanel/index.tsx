import { useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import { useSceneFetcher } from "@reearth/services/api";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";

type Props = {
  sceneId?: string;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const MapRightPanel: React.FC<Props> = ({ sceneId, showSceneSettings, currentCamera, onFlyTo }) => {
  const t = useT();
  const { useSceneQuery } = useSceneFetcher();

  const { scene } = useSceneQuery({ sceneId });

  const scenePropertyId = useMemo(() => scene?.property?.id, [scene?.property?.id]);
  const sceneSettings = useMemo(() => convert(scene?.property), [scene?.property]);

  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "map",
          title: t("Inspector"),
          //   maxHeight: !selectedWidget ? "100%" : "40%",
          children: showSceneSettings && scenePropertyId && (
            <Settings
              propertyId={scenePropertyId}
              propertyItems={sceneSettings}
              currentCamera={currentCamera}
              onFlyTo={onFlyTo}
            />
          ),
        },
      ]}
    />
  );
};

export default MapRightPanel;
