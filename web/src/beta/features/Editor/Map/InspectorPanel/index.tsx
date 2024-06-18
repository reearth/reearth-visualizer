import { FC, useMemo } from "react";

import SceneSettings from "@reearth/beta/features/Editor/common/Settings";
import { Panel } from "@reearth/beta/ui/layout";
import { Camera } from "@reearth/beta/utils/value";
import { FlyTo } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { Scene } from "@reearth/services/api/sceneApi";
import { useT } from "@reearth/services/i18n";

import { LayerConfigUpdateProps, SelectedLayer } from "../../hooks/useLayers";
import { LayerStyleValueUpdateProps } from "../../hooks/useLayerStyles";
import { GeoJsonFeatureUpdateProps } from "../../hooks/useSketch";

import LayerInspector from "./LayerInspector";
import LayerStyleEditor from "./LayerStyleEditor";

export type InspectorPanelProps = {
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

const InspectorPanel: FC<InspectorPanelProps> = ({
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
    <Panel
      title={t("Inspector")}
      storageId="editor-map-inspector-panel"
      extend
      alwaysOpen
      noPadding={!!selectedLayer}
      background="normal">
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
    </Panel>
  );
};

export default InspectorPanel;
