import { FC, useMemo } from "react";

import SceneSettings from "@reearth/beta/features/Editor/common/Settings";
import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

import { useMapPage } from "../context";

import LayerInspector from "./LayerInspector";
import LayerStyleEditor from "./LayerStyleEditor";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const InspectorPanel: FC<Props> = ({ areaRef, showCollapseArea }) => {
  const {
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
  } = useMapPage();

  const t = useT();

  const scenePropertyId = useMemo(() => scene?.property?.id, [scene?.property?.id]);

  return (
    <Panel
      title={t("Inspector")}
      storageId="editor-map-inspector-panel"
      extend
      alwaysOpen
      noPadding={!!selectedLayer}
      background="normal"
      areaRef={areaRef}
      showCollapseArea={showCollapseArea}>
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
