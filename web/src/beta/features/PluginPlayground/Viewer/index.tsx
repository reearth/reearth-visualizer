import { FC } from "react";

import Visualizer from "@reearth/beta/features/Visualizer";

import useHooks from "./hooks";

const Viewer: FC = () => {
  const { visualizerRef, sceneProperty, ready, engineMeta, currentCamera, setCurrentCamera } =
    useHooks();

  return (
    <Visualizer
      engine="cesium"
      visualizerRef={visualizerRef}
      sceneProperty={sceneProperty}
      ready={ready}
      engineMeta={engineMeta}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
    />
  );
};

export default Viewer;
