import { useMemo } from "react";

import SceneSettings from "@reearth/beta/features/Editor/Settings";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import type {
  LayerConfigUpdateProps,
  SelectedLayer,
} from "@reearth/beta/features/Editor/useLayers";
import type { LayerStyleValueUpdateProps } from "@reearth/beta/features/Editor/useLayerStyles";
import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/useSketch";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import type { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import type { Item } from "@reearth/services/api/propertyApi/utils";
import type { Scene } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";

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
  selectedLayer: SelectedLayer | undefined;
  onFlyTo?: FlyTo;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
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
  selectedLayer,
  onFlyTo,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
  onGeoJsonFeatureUpdate,
}) => {
  const t = useT();

  const scenePropertyId = useMemo(() => scene?.property?.id, [scene?.property?.id]);

  return (
    <SidePanelCommon
      location="right"
      padding={!selectedLayer ? 8 : undefined}
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
              {selectedLayer && (
                <LayerInspector
                  layerStyles={layerStyles}
                  layers={layers}
                  sceneId={sceneId}
                  selectedLayer={selectedLayer}
                  onLayerConfigUpdate={onLayerConfigUpdate}
                  onGeoJsonFeatureUpdate={onGeoJsonFeatureUpdate}
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
