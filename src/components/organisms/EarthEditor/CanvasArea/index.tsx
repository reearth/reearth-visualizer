import React from "react";

import Filled from "@reearth/components/atoms/Filled";
import Earth from "@reearth/components/molecules/EarthEditor/Earth";
import InfoBox from "@reearth/components/molecules/EarthEditor/InfoBox/InfoBox";
import ContentPicker from "@reearth/components/atoms/ContentPicker";
import FovSlider from "@reearth/components/molecules/EarthEditor/Earth/FovSlider";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  isBuilt?: boolean;
};

// TODO: ErrorBoudaryでエラーハンドリング

const CanvasArea: React.FC<Props> = ({ className, isBuilt }) => {
  const {
    rootLayerId,
    selectedLayerId,
    selectedBlockId,
    selectLayer,
    selectBlock,
    sceneProperty,
    layers,
    widgets,
    selectedLayer,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    blocks,
    onBlockInsert,
    isCapturing,
    onIsCapturingChange,
    camera,
    onCameraChange,
    onFovChange,
    initialLoaded,
  } = useHooks(isBuilt);

  return (
    <Filled className={className}>
      <Earth
        layers={layers}
        widgets={widgets}
        sceneProperty={sceneProperty}
        selectedLayerId={selectedLayerId}
        onLayerSelect={selectLayer}
        rootLayerId={rootLayerId}
        isCapturing={isCapturing}
        camera={camera}
        onCameraChange={onCameraChange}
        // small={!!small}
        isBuilt={!!isBuilt}
        initialLoaded={initialLoaded}
      />
      <InfoBox
        infoboxKey={selectedLayer?.id}
        visible={!!selectedLayer?.infobox}
        name={selectedLayer?.title}
        property={selectedLayer?.infobox?.property}
        blocks={selectedLayer?.infobox?.fields}
        isEditable={!isBuilt && selectedLayer?.infoboxEditable}
        isBuilt={!!isBuilt}
        selectedBlockId={selectedBlockId}
        onBlockSelect={selectBlock}
        onBlockChange={onBlockChange}
        onBlockMove={onBlockMove}
        onBlockDelete={onBlockRemove}
        onBlockInsert={onBlockInsert}
        sceneProperty={sceneProperty}
        renderInsertionPopUp={(onSelect, onClose) => (
          <ContentPicker items={blocks} onSelect={onSelect} onClickAway={onClose} />
        )}
      />
      <FovSlider
        isCapturing={isCapturing}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      />
    </Filled>
  );
};

export default CanvasArea;
