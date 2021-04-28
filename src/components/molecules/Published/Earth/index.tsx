import React, { useRef, useEffect } from "react";

import { SceneProperty } from "@reearth/util/value";
import Cesium, { Ref, Layer, Widget } from "@reearth/components/molecules/Common/Cesium";

export type EarthLayer = Layer;
export type EarthWidget = Widget;

export type Props = {
  className?: string;
  onLayerSelect?: (id?: string) => void;
  sceneProperty?: SceneProperty;
  layers?: EarthLayer[];
  widgets?: EarthWidget[];
  selectedLayerId?: string;
  initialLoaded?: boolean;
};

const Earth: React.FC<Props> = ({
  className,
  layers = [],
  widgets = [],
  sceneProperty,
  onLayerSelect,
  selectedLayerId,
  initialLoaded,
}) => {
  const cesium = useRef<Ref>(null);

  useEffect(() => {
    cesium.current?.requestRender();
  });

  return (
    <Cesium
      ref={cesium}
      className={className}
      property={sceneProperty}
      selectedEntityId={selectedLayerId}
      onEntitySelect={onLayerSelect}
      layers={layers}
      widgets={widgets}
      initialLoad={initialLoaded}
    />
  );
};

export default Earth;
