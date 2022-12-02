import React, { useCallback } from "react";

import ContentPicker from "@reearth/components/atoms/ContentPicker";
import FovSlider from "@reearth/components/molecules/EarthEditor/FovSlider";
import Visualizer, { Props as VisualizerProps } from "@reearth/components/molecules/Visualizer";
import { config } from "@reearth/config";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  isBuilt?: boolean;
  inEditor?: boolean;
};

const CanvasArea: React.FC<Props> = ({ className, isBuilt, inEditor }) => {
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
    engineMeta,
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
      inEditor={!!inEditor}
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
      pluginBaseUrl={config()?.plugins}
      widgetAlignEditorActivated={widgetAlignEditorActivated}
      engineMeta={engineMeta}
      onLayerSelect={selectLayer}
      onCameraChange={onCameraChange}
      onTick={onTick}
      onWidgetUpdate={onWidgetUpdate}
      onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
      onBlockSelect={selectBlock}
      onBlockChange={onBlockChange}
      onBlockMove={onBlockMove}
      onBlockDelete={onBlockRemove}
      onBlockInsert={onBlockInsert}
      onLayerDrop={handleDropLayer}
      onZoomToLayer={zoomToLayer}
      renderInfoboxInsertionPopUp={renderInfoboxInsertionPopUp}>
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
