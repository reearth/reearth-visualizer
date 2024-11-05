import Visualizer from "@reearth/beta/features/Visualizer";
import { ComponentProps, FC } from "react";

import useHooks from "./hooks";

type Props = {
  widets: ComponentProps<typeof Visualizer>["widgets"];
};

const Viewer: FC<Props> = ({ widets }) => {
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
      engineMeta={engineMeta}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
      widgets={widets}
    />
  );
};

export default Viewer;
