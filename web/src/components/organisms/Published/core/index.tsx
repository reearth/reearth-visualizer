import Error from "@reearth/components/molecules/Published/Error";
import { config } from "@reearth/config";
import Visualizer from "@reearth/core/Visualizer";

import useHooks from "./hooks";

export type Props = {
  alias?: string;
};

export default function Published({ alias }: Props) {
  const {
    sceneProperty,
    pluginProperty,
    layers,
    widgets,
    tags,
    ready,
    error,
    clusters,
    engineMeta,
  } = useHooks(alias);

  return error ? (
    <Error />
  ) : (
    <Visualizer
      engine="cesium"
      layers={layers}
      floatingWidgets={widgets?.floatingWidgets}
      widgetAlignSystem={widgets?.alignSystem}
      ownBuiltinWidgets={widgets?.ownBuiltinWidgets}
      tags={tags}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      clusters={clusters}
      ready={ready}
      isBuilt
      pluginBaseUrl={config()?.plugins}
      meta={engineMeta}
    />
  );
}
