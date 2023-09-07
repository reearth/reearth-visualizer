import Error from "@reearth/beta/features/Published/publishedError";
import Visualizer from "@reearth/classic/components/molecules/Visualizer";
import { config } from "@reearth/services/config";

import useHooks from "./hooks";
import { StoryPublished } from "./storyPublished";

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
    <StoryPublished selectedProjectType="story" />
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
