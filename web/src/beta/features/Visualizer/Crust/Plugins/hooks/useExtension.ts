import { useCallback } from "react";

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
  const pluginInstances = usePluginInstances({
    alignSystem,
    floatingWidgets,
    infoboxBlocks: selectedLayer?.layer?.infobox?.blocks,
    storyBlocks: selectedStory?.pages.flatMap((p) => p.blocks)
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
