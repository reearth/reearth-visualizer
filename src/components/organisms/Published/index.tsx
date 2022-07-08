import Error from "@reearth/components/molecules/Published/Error";
import Visualizer from "@reearth/components/molecules/Visualizer";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  alias?: string;
};

export default function Published({ className, alias }: Props) {
  const { sceneProperty, pluginProperty, rootLayer, widgets, tags, ready, error, clusterProperty } =
    useHooks(alias);

  return error ? (
    <Error />
  ) : (
    <Visualizer
      className={className}
      engine="cesium"
      rootLayer={rootLayer}
      widgets={widgets}
      tags={tags}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      clusterProperty={clusterProperty}
      ready={ready}
      isBuilt
      isPublished
      pluginBaseUrl={window.REEARTH_CONFIG?.plugins}
    />
  );
}
