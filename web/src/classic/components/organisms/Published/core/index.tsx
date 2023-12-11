import Error from "@reearth/classic/components/molecules/Published/Error";
import Visualizer from "@reearth/classic/core/Visualizer";
import { config } from "@reearth/services/config";

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
    selectedLayerId,
    layerSelectionReason,
    selectLayer,
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
      selectedLayerId={selectedLayerId}
      layerSelectionReason={layerSelectionReason}
      onLayerSelect={selectLayer}
    />
  );
}
