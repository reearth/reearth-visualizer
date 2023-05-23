import React, { useCallback } from "react";

import ContentPicker from "@reearth/classic/components/atoms/ContentPicker";
import FovSlider from "@reearth/classic/components/molecules/EarthEditor/FovSlider";
import Visualizer, { type Props as VisualizerProps } from "@reearth/classic/core/Visualizer";
import { config } from "@reearth/services/config";

import useHooks from "./hooks";

export type Props = {
  isBuilt?: boolean;
  inEditor?: boolean;
};

const CanvasArea: React.FC<Props> = ({ isBuilt, inEditor }) => {
  const {
    rootLayerId,
    selectedBlockId,
    zoomedLayerId,
    sceneProperty,
    pluginProperty,
    clusters,
    layers,
    widgets,
    tags,
    selectedLayerId,
    blocks,
    isCapturing,
    sceneMode,
    camera,
    selectedWidgetArea,
    widgetAlignEditorActivated,
    engineMeta,
    layerSelectionReason,
    useExperimentalSandbox,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    selectWidgetArea,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
    handleDropLayer,
    zoomToLayer,
  } = useHooks(isBuilt);
  const renderInfoboxInsertionPopUp = useCallback<
    NonNullable<VisualizerProps["renderInfoboxInsertionPopup"]>
  >(
    (onSelect, onClose) => (
      <ContentPicker items={blocks} onSelect={onSelect} onClickAway={onClose} />
    ),
    [blocks],
  );

  return (
    <>
      <Visualizer
        engine="cesium"
        isEditable={!isBuilt}
        isBuilt={!!isBuilt}
        inEditor={!!inEditor}
        layers={layers}
        widgetAlignSystem={widgets?.alignSystem}
        floatingWidgets={widgets?.floatingWidgets}
        widgetLayoutConstraint={widgets?.layoutConstraint}
        ownBuiltinWidgets={widgets?.ownBuiltinWidgets}
        selectedLayerId={selectedLayerId}
        selectedBlockId={selectedBlockId}
        selectedWidgetArea={selectedWidgetArea}
        zoomedLayerId={zoomedLayerId}
        rootLayerId={rootLayerId}
        sceneProperty={sceneProperty}
        tags={tags}
        pluginProperty={pluginProperty}
        clusters={clusters}
        camera={camera}
        ready={isBuilt || (!!layers && !!widgets)}
        pluginBaseUrl={config()?.plugins}
        widgetAlignSystemEditing={widgetAlignEditorActivated}
        meta={engineMeta}
        layerSelectionReason={layerSelectionReason}
        useExperimentalSandbox={useExperimentalSandbox}
        onLayerSelect={selectLayer}
        onCameraChange={onCameraChange}
        onWidgetLayoutUpdate={onWidgetUpdate}
        onWidgetAlignmentUpdate={onWidgetAlignSystemUpdate}
        onWidgetAreaSelect={selectWidgetArea}
        onBlockSelect={selectBlock}
        onBlockChange={onBlockChange}
        onBlockMove={onBlockMove}
        onBlockDelete={onBlockRemove}
        onBlockInsert={onBlockInsert}
        onLayerDrop={handleDropLayer}
        onZoomToLayer={zoomToLayer}
        renderInfoboxInsertionPopup={renderInfoboxInsertionPopUp}
      />
      <FovSlider
        visible={isCapturing && sceneMode && sceneMode !== "2d"}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      />
    </>
  );
};

export default CanvasArea;
