import Visualizer from "@reearth/beta/features/Visualizer";
import { Layer, MapRef } from "@reearth/core";
import { ComponentProps, FC, MutableRefObject } from "react";

import { Story } from "../../Visualizer/Crust/StoryPanel";

import useHooks from "./hooks";

type Props = {
  layers: Layer[];
  showStoryPanel: boolean;
  story: Story | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  widgets: ComponentProps<typeof Visualizer>["widgets"];
};

const Viewer: FC<Props> = ({
  layers,
  showStoryPanel,
  story,
  visualizerRef,
  widgets
}) => {
  const { currentCamera, engineMeta, ready, setCurrentCamera, viewerProperty } =
    useHooks({ visualizerRef });

  return (
    <Visualizer
      engine="cesium"
      visualizerRef={visualizerRef}
      viewerProperty={viewerProperty}
      ready={ready}
      layers={layers}
      engineMeta={engineMeta}
      currentCamera={currentCamera}
      onCameraChange={setCurrentCamera}
      widgets={widgets}
      story={story}
      showStoryPanel={showStoryPanel}
    />
  );
};

export default Viewer;
