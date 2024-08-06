import { FC } from "react";

import Visualizer from "@reearth/beta/features/Visualizer";

import useHooks from "./hooks";

const Viewer: FC = () => {
  const { visualizerRef, viewerProperty, ready, engineMeta, currentCamera, setCurrentCamera } =
    useHooks();

  return (
    <Visualizer
      engine="cesium"
      visualizerRef={visualizerRef}
      viewerProperty={viewerProperty}
      ready={ready}
      engineMeta={engineMeta}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
    />
  );
};

export default Viewer;
