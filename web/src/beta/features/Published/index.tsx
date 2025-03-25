import Visualizer from "@reearth/beta/features/Visualizer";

import useHooks from "./hooks";
import NotFound from "./NotFound";

export type Props = {
  alias?: string;
};

export default function Published({ alias }: Props) {
  const {
    viewerProperty,
    pluginProperty,
    layers,
    nlsLayers,
    widgets,
    widgetThemeOptions,
    story,
    ready,
    error,
    engineMeta,
    visualizerRef,
    currentCamera,
    initialCamera,
    setCurrentCamera
  } = useHooks(alias);

  return error ? (
    <NotFound />
  ) : (
    <Visualizer
      visualizerRef={visualizerRef}
      engine="cesium"
      engineMeta={engineMeta}
      isBuilt
      ready={ready}
      layers={layers}
      nlsLayers={nlsLayers}
      widgets={widgets}
      widgetThemeOptions={widgetThemeOptions}
      story={story}
      viewerProperty={viewerProperty}
      pluginProperty={pluginProperty}
      showStoryPanel={!!story}
      currentCamera={currentCamera}
      initialCamera={initialCamera}
      onCameraChange={setCurrentCamera}
    />
  );
}
