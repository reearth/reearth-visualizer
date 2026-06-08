import { useSceneSettingNavigationTarget } from "@reearth/app/features/Editor/atoms";
import { Panel, PanelProps } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { FC, useEffect, useMemo } from "react";

import { useMapPage } from "../context";

import { usePropertyDecorations } from "./hooks";
import LayerInspector from "./LayerInspector";
import SceneSettings from "./SceneSettings";

type Props = Pick<PanelProps, "showCollapseArea" | "areaRef">;

const InspectorPanel: FC<Props> = ({ areaRef, showCollapseArea }) => {
  const {
    scene,
    layers,
    layerStyles,
    sceneId,
    selectedSceneSetting,
    sceneSettings,
    selectedLayer,
    selectedFeature,
    selectedSketchFeature,
    handleFlyTo,
    handleLayerConfigUpdate,
    handleLayerNameUpdate,
    handleGeoJsonFeatureUpdate,
    handleSceneSettingSelect
  } = useMapPage();

  const t = useT();

  const scenePropertyId = useMemo(
    () => scene?.property?.id,
    [scene?.property?.id]
  );

  // Compute property field decorations with business logic
  const computeDecorations = usePropertyDecorations();

  // Navigation effect: Listen to navigation target atom and trigger navigation
  const [navigationTarget, setNavigationTarget] = useSceneSettingNavigationTarget();

  useEffect(() => {
    if (navigationTarget) {
      handleSceneSettingSelect(navigationTarget);
      // Clear the navigation target after navigation
      setNavigationTarget(undefined);
    }
  }, [navigationTarget, handleSceneSettingSelect, setNavigationTarget]);

  return (
    <Panel
      title={t("Inspector")}
      dataTestid="editor-map-inspector-panel"
      storageId="editor-map-inspector-panel"
      extend
      alwaysOpen
      noPadding={!!selectedLayer}
      areaRef={areaRef}
      showCollapseArea={showCollapseArea}
    >
      {!!selectedSceneSetting && scenePropertyId && (
        <SceneSettings
          propertyId={scenePropertyId}
          propertyItems={sceneSettings}
          onFlyTo={handleFlyTo}
          computeDecorations={computeDecorations}
        />
      )}
      {selectedLayer && (
        <LayerInspector
          layerStyles={layerStyles}
          layers={layers}
          sceneId={sceneId}
          selectedLayer={selectedLayer}
          selectedFeature={selectedFeature}
          selectedSketchFeature={selectedSketchFeature}
          onLayerConfigUpdate={handleLayerConfigUpdate}
          onGeoJsonFeatureUpdate={handleGeoJsonFeatureUpdate}
          onLayerNameUpdate={handleLayerNameUpdate}
        />
      )}
    </Panel>
  );
};

export default InspectorPanel;
