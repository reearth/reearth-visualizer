import Visualizer from "@reearth/beta/features/Visualizer";
import { MapRef } from "@reearth/core";
import { ComponentProps, FC, MutableRefObject } from "react";

import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";

import useHooks from "./hooks";

type Props = {
  widgets: ComponentProps<typeof Visualizer>["widgets"];
  visualizerRef: MutableRefObject<MapRef | null>;
};

const Viewer: FC<Props> = ({ widgets, visualizerRef }) => {
  const { viewerProperty, ready, engineMeta, currentCamera, setCurrentCamera } =
    useHooks({ visualizerRef });

  return (
    <Visualizer
      engine="cesium"
      visualizerRef={visualizerRef}
      viewerProperty={viewerProperty}
      ready={ready}
      layers={DEFAULT_LAYERS_PLUGIN_PLAYGROUND}
      engineMeta={engineMeta}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
      widgets={widgets}
    />
  );
};

export default Viewer;
