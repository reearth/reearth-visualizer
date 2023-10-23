import { useMemo } from "react";

import Settings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import { useSceneFetcher } from "@reearth/services/api";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";

import { LayerConfigUpdateProps } from "../../../useLayers";
import { LayerStyleValueUpdateProps } from "../../../useLayerStyles";

import InspectorTabs from "./InspectorTabs";
import LayerStyleEditor from "./LayerStyleValueEditor";

type Props = {
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  sceneId?: string;
  selectedLayerId?: string;
  selectedLayerStyleId?: string;
  showSceneSettings?: boolean;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const MapRightPanel: React.FC<Props> = ({
  layers,
  layerStyles,
  sceneId,
  showSceneSettings,
  selectedLayerStyleId,
  selectedLayerId,
  currentCamera,
  onFlyTo,
  onLayerStyleValueUpdate,
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
                  layerStyles={layerStyles}
                  layers={layers}
                  sceneId={sceneId}
                  selectedLayerId={selectedLayerId}
                  onLayerConfigUpdate={onLayerConfigUpdate}
                />
              )}
              {selectedLayerStyleId && (
                <LayerStyleEditor
                  selectedLayerStyleId={selectedLayerStyleId}
                  sceneId={sceneId}
                  onLayerStyleValueUpdate={onLayerStyleValueUpdate}
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
