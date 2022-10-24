import React, { useCallback } from "react";

import ContentPicker from "@reearth/components/atoms/ContentPicker";
import FovSlider from "@reearth/components/molecules/EarthEditor/FovSlider";
import Visualizer, { Props as VisualizerProps } from "@reearth/components/molecules/Visualizer";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  isBuilt?: boolean;
};

// TODO: ErrorBoudaryでエラーハンドリング

const CanvasArea: React.FC<Props> = ({ className, isBuilt }) => {
  const {
    rootLayerId,
    selectedBlockId,
    zoomedLayerId,
    sceneProperty,
    pluginProperty,
    clusterProperty,
    rootLayer,
    widgets,
    tags,
    selectedLayerId,
    blocks,
    isCapturing,
    sceneMode,
    camera,
    clock,
    widgetAlignEditorActivated,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    onIsCapturingChange,
    onCameraChange,
    onTick,
    onFovChange,
    handleDropLayer,
    zoomToLayer,
  } = useHooks(isBuilt);
  const renderInfoboxInsertionPopUp = useCallback<
    NonNullable<VisualizerProps["renderInfoboxInsertionPopUp"]>
  >(
    (onSelect, onClose) => (
      <ContentPicker items={blocks} onSelect={onSelect} onClickAway={onClose} />
    ),
    [blocks],
  );

  return (
    <Visualizer
      className={className}
      engine="cesium"
      isEditable={!isBuilt}
      isBuilt={!!isBuilt}
      rootLayer={rootLayer}
      widgets={widgets}
      selectedLayerId={selectedLayerId}
      selectedBlockId={selectedBlockId}
      zoomedLayerId={zoomedLayerId}
      rootLayerId={rootLayerId}
      sceneProperty={sceneProperty}
      tags={tags}
      pluginProperty={pluginProperty}
      clusterProperty={clusterProperty}
      camera={camera}
      clock={clock}
      ready={isBuilt || (!!rootLayer && !!widgets)}
      onLayerSelect={selectLayer}
      widgetAlignEditorActivated={widgetAlignEditorActivated}
      onCameraChange={onCameraChange}
      onTick={onTick}
      onWidgetUpdate={onWidgetUpdate}
      onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
      onBlockSelect={selectBlock}
      onBlockChange={onBlockChange}
      onBlockMove={onBlockMove}
      onBlockDelete={onBlockRemove}
      onBlockInsert={onBlockInsert}
      renderInfoboxInsertionPopUp={renderInfoboxInsertionPopUp}
      onLayerDrop={handleDropLayer}
      pluginBaseUrl={window.REEARTH_CONFIG?.plugins}
      onZoomToLayer={zoomToLayer}>
      <FovSlider
        visible={isCapturing && sceneMode && sceneMode !== "2d"}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      />
    </Visualizer>
  );
};

export default CanvasArea;
