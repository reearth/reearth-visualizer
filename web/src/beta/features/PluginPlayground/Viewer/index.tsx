import Visualizer from "@reearth/beta/features/Visualizer";
import { ComponentProps, FC } from "react";

import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";

import useHooks from "./hooks";

type Props = {
  widgets: ComponentProps<typeof Visualizer>["widgets"];
};

const Viewer: FC<Props> = ({ widgets }) => {
  const {
    visualizerRef,
    viewerProperty,
    ready,
    engineMeta,
    currentCamera,
    setCurrentCamera
  } = useHooks();

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
