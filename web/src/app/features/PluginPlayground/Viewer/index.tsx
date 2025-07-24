import Visualizer from "@reearth/app/features/Visualizer";
import { Layer, MapRef } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { ComponentProps, FC, MutableRefObject } from "react";

import { Story } from "../../Visualizer/Crust/StoryPanel";

import useHooks from "./hooks";

type Props = {
  enabledVisualizer: boolean;
  layers: Layer[];
  showStoryPanel: boolean;
  story: Story | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  widgets: ComponentProps<typeof Visualizer>["widgets"];
};

const Viewer: FC<Props> = ({
  enabledVisualizer,
  layers,
  showStoryPanel,
  story,
  visualizerRef,
  widgets
}) => {
  const { currentCamera, engineMeta, ready, setCurrentCamera, viewerProperty } =
    useHooks({ visualizerRef, enabledVisualizer });

  return (
    enabledVisualizer && (
      <VisualizerWrapper>
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
      </VisualizerWrapper>
    )
  );
};

const VisualizerWrapper = styled("div")({
  minWidth: 768,
  height: "100%"
});

export default Viewer;
