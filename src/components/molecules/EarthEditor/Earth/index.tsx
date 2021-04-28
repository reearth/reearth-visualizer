import React from "react";

import { SceneProperty, Camera } from "@reearth/util/value";
import Filled from "@reearth/components/atoms/Filled";
import DropHolder from "@reearth/components/atoms/DropHolder";
import Cesium, { Layer, Widget } from "@reearth/components/molecules/Common/Cesium";

import useHooks from "./hooks";

export type EarthLayer = Layer;
export type EarthWidget = Widget;

export type Props = {
  className?: string;
  isBuilt?: boolean;
  layers?: EarthLayer[];
  widgets?: EarthWidget[];
  selectedLayerId?: string;
  rootLayerId?: string;
  sceneProperty?: SceneProperty;
  isCapturing?: boolean;
  camera?: Camera;
  small?: boolean;
  initialLoaded?: boolean;
  onLayerSelect?: (id?: string) => void;
  onDroppableChange?: (droppable: boolean) => void;
  onCameraChange?: (camera: Camera) => void;
};

const Earth: React.FC<Props> = ({
  className,
  isBuilt,
  layers = [],
  widgets = [],
  selectedLayerId,
  rootLayerId,
  sceneProperty,
  isCapturing,
  camera,
  small,
  initialLoaded,
  onLayerSelect,
  onDroppableChange,
  onCameraChange,
}) => {
  const { cesiumRef, wrapperRef, isDroppable } = useHooks({
    rootLayerId,
    onDroppableChange,
  });

  return (
    <Filled ref={wrapperRef}>
      {isDroppable && <DropHolder />}
      <Cesium
        ref={cesiumRef}
        className={className}
        property={sceneProperty}
        selectedEntityId={selectedLayerId}
        onEntitySelect={onLayerSelect}
        isEditable={!isBuilt}
        layers={layers}
        widgets={widgets}
        isCapturing={isCapturing}
        camera={camera}
        onCameraChange={onCameraChange}
        small={small}
        initialLoad={initialLoaded}
      />
    </Filled>
  );
};

export default Earth;
