import Visualizer from "@reearth/beta/features/Visualizer";
import { NotFound } from "@reearth/beta/lib/reearth-ui";

import useHooks from "./hooks";

export type Props = {
  alias?: string;
};

export default function Published({ alias }: Props) {
  const {
    viewerProperty,
    pluginProperty,
    layers,
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
