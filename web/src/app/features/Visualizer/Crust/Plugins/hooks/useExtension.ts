import { useCallback, useMemo } from "react";

import { useGet } from "../../utils";
import { Props } from "../types";
import usePluginInstances from "../usePluginInstances";

export default ({
  alignSystem,
  floatingWidgets,
  selectedLayer,
  selectedStory
}: Pick<
  Props,
  "alignSystem" | "floatingWidgets" | "selectedLayer" | "selectedStory"
>) => {
  // Create a stable key based on actual block IDs to prevent unnecessary rerenders
  const storyBlocksKey = useMemo(() => {
    if (!selectedStory?.pages) return "";
    return selectedStory.pages
      .flatMap((p) => p.blocks.map((b) => b.id))
      .join(",");
  }, [selectedStory?.pages]);

  const storyBlocks = useMemo(
    () => selectedStory?.pages.flatMap((p) => p.blocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storyBlocksKey]
  );

  // Create a stable key for infobox blocks
  const infoboxBlocksKey = useMemo(() => {
    if (!selectedLayer?.layer?.infobox?.blocks) return "";
    return selectedLayer.layer.infobox.blocks.map((b) => b.id).join(",");
  }, [selectedLayer?.layer?.infobox?.blocks]);

  const infoboxBlocks = useMemo(
    () => selectedLayer?.layer?.infobox?.blocks,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [infoboxBlocksKey]
  );

  const pluginInstances = usePluginInstances({
    alignSystem,
    floatingWidgets,
    infoboxBlocks,
    storyBlocks
  });

  const getPluginInstances = useGet(pluginInstances);

  const getExtensionList = useCallback(
    () => getPluginInstances().meta.current,
    [getPluginInstances]
  );

  return {
    pluginInstances,
    getExtensionList
  };
};
