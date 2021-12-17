import React from "react";

import Error from "@reearth/components/molecules/Published/Error";
import Visualizer from "@reearth/components/molecules/Visualizer";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  alias?: string;
};

export default function Published({ className, alias }: Props) {
  const {
    sceneProperty,
    pluginProperty,
    layers,
    widgets,
    ready,
    error,
    clusterProperty,
    clusterLayers,
  } = useHooks(alias);

  return error ? (
    <Error />
  ) : (
    <Visualizer
      className={className}
      engine="cesium"
      layers={layers}
      widgets={widgets}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      clusterProperty={clusterProperty}
      clusterLayers={clusterLayers}
      ready={ready}
      isBuilt
      isPublished
      pluginBaseUrl={window.REEARTH_CONFIG?.plugins}
    />
  );
}
