import { FC, useMemo } from "react";

import { Panel, PanelProps } from "@reearth/beta/ui/layout";
import { useT } from "@reearth/services/i18n";

import { useMapPage } from "../context";

import LayerInspector from "./LayerInspector";
import LayerStyleEditor from "./LayerStyleEditor";
import SceneSettings from "./SceneSettings";

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
    selectedLayer,
    handleFlyTo,
    handleLayerStyleValueUpdate,
    handleLayerConfigUpdate,
    handleGeoJsonFeatureUpdate,
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
          onFlyTo={handleFlyTo}
        />
      )}
      {selectedLayer && (
        <LayerInspector
          layerStyles={layerStyles}
          layers={layers}
          sceneId={sceneId}
          selectedLayer={selectedLayer}
          onLayerConfigUpdate={handleLayerConfigUpdate}
          onGeoJsonFeatureUpdate={handleGeoJsonFeatureUpdate}
        />
      )}
      {selectedLayerStyleId && (
        <LayerStyleEditor
          selectedLayerStyleId={selectedLayerStyleId}
          sceneId={sceneId}
          onLayerStyleValueUpdate={handleLayerStyleValueUpdate}
        />
      )}
    </Panel>
  );
};

export default InspectorPanel;
