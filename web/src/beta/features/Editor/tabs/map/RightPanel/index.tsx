import { useMemo } from "react";

import SceneSettings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import type { LayerConfigUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import type { LayerStyleValueUpdateProps } from "@reearth/beta/features/Editor/useLayerStyles";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import type { Scene } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";
import { useSelectedLayer } from "@reearth/services/state";

import LayerInspector from "./LayerInspector";
import LayerStyleEditor from "./LayerStyleValueEditor";

type Props = {
  scene?: Scene;
  sceneSettings?: Item[];
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  sceneId?: string;
  selectedLayerStyleId?: string;
  selectedSceneSetting?: string;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const MapRightPanel: React.FC<Props> = ({
  scene,
  layers,
  layerStyles,
  sceneId,
  selectedLayerStyleId,
  selectedSceneSetting,
  sceneSettings,
  currentCamera,
  onFlyTo,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
}) => {
  const t = useT();

  const scenePropertyId = useMemo(() => scene?.property?.id, [scene?.property?.id]);

  const [selectedLayerId] = useSelectedLayer();

  return (
    <SidePanelCommon
      location="right"
      padding={!selectedLayerId ? 8 : undefined}
      contents={[
        {
          id: "map",
          title: t("Inspector"),
          children: (
            <>
              {!!selectedSceneSetting && scenePropertyId && (
                <SceneSettings
                  propertyId={scenePropertyId}
                  propertyItems={sceneSettings}
                  currentCamera={currentCamera}
                  onFlyTo={onFlyTo}
                />
              )}
              {selectedLayerId && (
                <LayerInspector
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
