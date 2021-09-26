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
    sceneProperty,
    layers,
    widgets,
    selectedLayer,
    blocks,
    isCapturing,
    camera,
    ready,
    widgetAlignEditor,
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
    onFovChange,
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
      primitives={layers}
      widgets={widgets}
      selectedPrimitiveId={selectedLayer?.id}
      selectedBlockId={selectedBlockId}
      rootLayerId={rootLayerId}
      sceneProperty={sceneProperty}
      camera={camera}
      ready={ready}
      widgetAlignEditorActivated={widgetAlignEditor}
      onPrimitiveSelect={selectLayer}
      onCameraChange={onCameraChange}
      onWidgetUpdate={onWidgetUpdate}
      onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
      onBlockSelect={selectBlock}
      onBlockChange={onBlockChange}
      onBlockMove={onBlockMove}
      onBlockDelete={onBlockRemove}
      onBlockInsert={onBlockInsert}
      renderInfoboxInsertionPopUp={renderInfoboxInsertionPopUp}
      pluginBaseUrl={window.REEARTH_CONFIG?.plugins}>
      <FovSlider
        isCapturing={isCapturing}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      />
    </Visualizer>
  );
};

export default CanvasArea;
