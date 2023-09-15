import Error from "@reearth/beta/features/Published/publishedError";
import StoryPanel from "@reearth/beta/lib/core/StoryPanel";
import VisualizerStory from "@reearth/beta/lib/core/Visualizer";
import Visualizer from "@reearth/classic/components/molecules/Visualizer";
import { config } from "@reearth/services/config";

import useHooks from "./hooks";

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
    storyJsonData,
  } = useHooks(alias);

  // eslint-disable-next-line no-prototype-builtins
  const isStoryPublish = storyJsonData?.hasOwnProperty("story");

  const pages = storyJsonData?.story?.pages;

  const blocksArray = [];

  for (const page of pages) {
    const blocks = page.blocks;
    blocksArray.push(...blocks); // Concatenate the blocks from each page into the array
  }

  // Now, blocksArray contains all the blocks from the pages
  console.log(blocksArray);

  console.log(storyJsonData);
  return error ? (
    <Error />
  ) : isStoryPublish ? (
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
      <StoryPanel installedStoryBlocks={blocksArray} />
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
