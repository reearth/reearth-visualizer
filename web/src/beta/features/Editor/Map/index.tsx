import { FC, useRef } from "react";

import { Window, Area, type AreaSize } from "@reearth/beta/ui/layout";

import InspectorPanel, { InspectorPanelProps } from "./InspectorPanel";
import LayersPanel, { LayersPanelProps } from "./LayersPanel";
import LayerStylePanel, { LayerStylePanelProps } from "./LayerStylePanel";
import ScenePanel, { ScenePanelProps } from "./ScenePanel";
import ToolsPanel, { ToolsPanelProps } from "./ToolsPanel";

export type MapTabProps = {
  onVisualizerResize?: (props: AreaSize) => void;
} & ToolsPanelProps &
  ScenePanelProps &
  LayersPanelProps &
  LayerStylePanelProps &
  InspectorPanelProps;

const Map: FC<MapTabProps> = ({
  onVisualizerResize,
  // tools
  sketchEnabled,
  sketchType,
  onSketchTypeChange,
  // scene
  scene,
  selectedSceneSetting,
  onSceneSettingSelect,
  // layers
  layers,
  selectedLayerId,
  onLayerDelete,
  onLayerNameUpdate,
  onLayerSelect,
  onDataSourceLayerCreatorOpen,
  onSketchLayerCreatorOpen,
  onLayerVisibilityUpate,
  onFlyTo,
  // layer style
  layerStyles,
  selectedLayerStyleId,
  onLayerStyleAdd,
  onLayerStyleDelete,
  onLayerStyleNameUpdate,
  onLayerStyleSelect,
  // inspector
  sceneId,
  sceneSettings,
  currentCamera,
  selectedLayer,
  onLayerStyleValueUpdate,
  onLayerConfigUpdate,
  onGeoJsonFeatureUpdate,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" resizableEdge="right" storageId="editor-map-left-area">
          <ScenePanel
            scene={scene}
            selectedSceneSetting={selectedSceneSetting}
            onSceneSettingSelect={onSceneSettingSelect}
          />
          <LayersPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onLayerDelete={onLayerDelete}
            onLayerNameUpdate={onLayerNameUpdate}
            onLayerSelect={onLayerSelect}
            onDataSourceLayerCreatorOpen={onDataSourceLayerCreatorOpen}
            onSketchLayerCreatorOpen={onSketchLayerCreatorOpen}
            onLayerVisibilityUpate={onLayerVisibilityUpate}
            onFlyTo={onFlyTo}
          />
        </Area>
        <Area direction="column" extend asWrapper>
          <Area height={34}>
            <ToolsPanel
              sketchEnabled={sketchEnabled}
              sketchType={sketchType}
              onSketchTypeChange={onSketchTypeChange}
            />
          </Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
          <Area resizableEdge="top" storageId="editor-map-bottom-area">
            <LayerStylePanel
              layerStyles={layerStyles}
              selectedLayerStyleId={selectedLayerStyleId}
              onLayerStyleAdd={onLayerStyleAdd}
              onLayerStyleDelete={onLayerStyleDelete}
              onLayerStyleNameUpdate={onLayerStyleNameUpdate}
              onLayerStyleSelect={onLayerStyleSelect}
            />
          </Area>
        </Area>
        <Area direction="column" resizableEdge="left" storageId="editor-map-right-area">
          <InspectorPanel
            scene={scene}
            layers={layers}
            layerStyles={layerStyles}
            sceneId={sceneId}
            selectedLayerStyleId={selectedLayerStyleId}
            selectedSceneSetting={selectedSceneSetting}
            sceneSettings={sceneSettings}
            currentCamera={currentCamera}
            selectedLayer={selectedLayer}
            onFlyTo={onFlyTo}
            onLayerStyleValueUpdate={onLayerStyleValueUpdate}
            onLayerConfigUpdate={onLayerConfigUpdate}
            onGeoJsonFeatureUpdate={onGeoJsonFeatureUpdate}
          />
        </Area>
      </Area>
    </Window>
  );
};

export default Map;
