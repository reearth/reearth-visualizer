import { useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import { useSceneFetcher } from "@reearth/services/api";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";

import { AppearanceValueUpdateProps } from "../../../useAppearances";
import { LayerConfigUpdateProps } from "../../../useLayers";

import AppearanceEditor from "./AppearanceValueEditor";
import InspectorTabs from "./InspectorTabs";

type Props = {
  appearances?: NLSAppearance[];
  layers?: NLSLayer[];
  sceneId?: string;
  selectedLayerId?: string;
  selectedAppearanceId?: string;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
  onAppearanceValueUpdate?: (inp: AppearanceValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const MapRightPanel: React.FC<Props> = ({
  layers,
  appearances,
  sceneId,
  showSceneSettings,
  selectedAppearanceId,
  selectedLayerId,
  currentCamera,
  onFlyTo,
  onAppearanceValueUpdate,
  onLayerConfigUpdate,
}) => {
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
          children: (
            <>
              {showSceneSettings && scenePropertyId && (
                <Settings
                  propertyId={scenePropertyId}
                  propertyItems={sceneSettings}
                  currentCamera={currentCamera}
                  onFlyTo={onFlyTo}
                />
              )}
              {selectedLayerId && (
                <InspectorTabs
                  appearances={appearances}
                  layers={layers}
                  sceneId={sceneId}
                  selectedLayerId={selectedLayerId}
                  onLayerConfigUpdate={onLayerConfigUpdate}
                />
              )}
              {selectedAppearanceId && (
                <AppearanceEditor
                  selectedAppearanceId={selectedAppearanceId}
                  sceneId={sceneId}
                  onAppearanceValueUpdate={onAppearanceValueUpdate}
                />
              )}
            </>
          ),
        },
      ]}
    />
  );
};

export default MapRightPanel;
