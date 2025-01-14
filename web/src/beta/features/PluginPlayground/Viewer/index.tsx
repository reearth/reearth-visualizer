import Visualizer from "@reearth/beta/features/Visualizer";
import { Layer, MapRef } from "@reearth/core";
import { ComponentProps, FC, MutableRefObject } from "react";

import useHooks from "./hooks";

type Props = {
  infoboxBlocks: ComponentProps<typeof Visualizer>["installableInfoboxBlocks"];
  layers: Layer[];
  widgets: ComponentProps<typeof Visualizer>["widgets"];
  visualizerRef: MutableRefObject<MapRef | null>;
};

const Viewer: FC<Props> = ({
  infoboxBlocks,
  layers,
  widgets,
  visualizerRef
}) => {
  const { currentCamera, engineMeta, ready, setCurrentCamera, viewerProperty } =
    useHooks({ visualizerRef });

  return (
    <Visualizer
      engine="cesium"
      visualizerRef={visualizerRef}
      viewerProperty={viewerProperty}
      ready={ready}
      layers={layers} // should add infobox in layers
      engineMeta={engineMeta}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
      widgets={widgets}
      installableInfoboxBlocks={infoboxBlocks} // remove this
    />
  );
};

export default Viewer;
