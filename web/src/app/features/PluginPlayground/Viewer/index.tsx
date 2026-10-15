import Visualizer from "@reearth/app/features/Visualizer";
import { Layer, MapRef } from "@reearth/core";
import { styled } from "@reearth/services/theme";
import { ComponentProps, FC, MutableRefObject } from "react";

import { Story } from "../../Visualizer/Crust/StoryPanel";

import useHooks from "./hooks";

type Props = {
  enabledVisualizer: boolean;
  /** Keeps the camera where it was when the map is remounted. */
  keepCamera?: boolean;
  layers: Layer[];
  showStoryPanel: boolean;
  story: Story | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  widgets: ComponentProps<typeof Visualizer>["widgets"];
  onMount?: () => void;
  onLayerSelect?: ComponentProps<typeof Visualizer>["onCoreLayerSelect"];
};

const Viewer: FC<Props> = ({
  enabledVisualizer,
  keepCamera,
  layers,
  showStoryPanel,
  story,
  visualizerRef,
  widgets,
  onMount,
  onLayerSelect
}) => {
  const { currentCamera, engineMeta, ready, setCurrentCamera, viewerProperty } =
    useHooks({ visualizerRef, enabledVisualizer, keepCamera });

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
          handleMount={onMount}
          onCoreLayerSelect={onLayerSelect}
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
