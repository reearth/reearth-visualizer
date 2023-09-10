import Error from "@reearth/beta/features/Published/publishedError";
import VisualizerStory from "@reearth/beta/lib/core/Visualizer";
import Visualizer from "@reearth/classic/components/molecules/Visualizer";
import { config } from "@reearth/services/config";

import useHooks from "./hooks";
import StoryPanelPublished from "./StoryPanelPublish";

export type Props = {
  className?: string;
  alias?: string;
};

export default function Published({ className, alias }: Props) {
  const {
    sceneProperty,
    pluginProperty,
    rootLayer,
    widgets,
    tags,
    ready,
    error,
    clusterProperty,
    engineMeta,
  } = useHooks(alias);

  const checkSelectedTab = localStorage.getItem("selectedTab");

  return error ? (
    <Error />
  ) : checkSelectedTab === "story" ? (
    <VisualizerStory
      engine="cesium"
      floatingWidgets={widgets?.floatingWidgets}
      tags={tags}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      ready={ready}
      isBuilt
      pluginBaseUrl={config()?.plugins}
      meta={engineMeta}>
      <StoryPanelPublished />
    </VisualizerStory>
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
      pluginBaseUrl={config()?.plugins}
      engineMeta={engineMeta}
    />
  );
}
