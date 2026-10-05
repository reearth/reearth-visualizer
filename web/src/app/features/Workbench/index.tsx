import Visualizer from "@reearth/app/features/Visualizer";
import { FC } from "react";

import useHooks from "./hooks";

const Workbench: FC = () => {
  const {
    viewerProperty,
    layers,
    ready,
    engineMeta,
    visualizerRef,
    currentCamera,
    setCurrentCamera,
    widgets,
    story,
    showStoryPanel
  } = useHooks();

  return (
    <Visualizer
      visualizerRef={visualizerRef}
      engine="cesium"
      engineMeta={engineMeta}
      isBuilt
      ready={ready}
      layers={layers}
      widgets={widgets}
      story={story}
      showStoryPanel={showStoryPanel}
      viewerProperty={viewerProperty}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
    />
  );
};

export default Workbench;
