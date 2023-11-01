import { useReactiveVar } from "@apollo/client";
import { useMemo } from "react";

import SceneSettings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { LayerConfigUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import { LayerStyleValueUpdateProps } from "@reearth/beta/features/Editor/useLayerStyles";
import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { Scene } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { selectedLayerVar } from "@reearth/services/state";

import LayerInspector from "./LayerInspector";
import LayerStyleEditor from "./LayerStyleValueEditor";

type Props = {
  scene?: Scene;
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  sceneId?: string;
  selectedLayerStyleId?: string;
  showSceneSettings?: boolean;
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
  currentCamera,
  onFlyTo,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
}) => {
  const t = useT();

  const scenePropertyId = useMemo(() => scene?.property?.id, [scene?.property?.id]);
  const sceneSettings = useMemo(
    () => convert(scene?.property)?.filter(item => item.collection === selectedSceneSetting),
    [scene?.property, selectedSceneSetting],
  );

  const selectedLayerId = useReactiveVar(selectedLayerVar);

  return (
    <SidePanelCommon
      location="right"
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
