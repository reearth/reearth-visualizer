import React from "react";

import Visualizer from "@reearth/components/molecules/Visualizer";
import Error from "@reearth/components/molecules/Published/Error";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  alias?: string;
};

export default function Published({ className, alias }: Props) {
  const { sceneProperty, layers, widgets, ready, error } = useHooks(alias);

  return error ? (
    <Error />
  ) : (
    <Visualizer
      className={className}
      engine="cesium"
      primitives={layers}
      widgets={widgets}
      sceneProperty={sceneProperty}
      ready={ready}
      isBuilt
      isPublished
      pluginBaseUrl={window.REEARTH_CONFIG?.plugins}
    />
  );
}
