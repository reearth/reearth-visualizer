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
  /**
   * Why no memoization here?
   *
   * These arrays are passed to usePluginInstances, which updates the context.
   * However, we use a ref-based context pattern that prevents React from notifying
   * consumers when the context value changes. Additionally, pluginContextRef in
   * useZushiPlugin prevents plugin remounts even when context data updates.
   *
   * PREVIOUS APPROACH (REMOVED):
   * We tried memoizing these arrays using a key string (joined block IDs), only
   * recreating them when the key changed. However, this had a critical flaw:
   * - Adding/removing/editing ANY block would change the key
   * - This would recreate the ENTIRE array with new references for ALL blocks
   * - Every Plugin component would receive new props and re-render
   * - This couples all blocks together (changing one affects all)
   *
   * CURRENT APPROACH:
   * Let the arrays update naturally when selectedStory/selectedLayer changes.
   * The ref-based context and pluginContextRef patterns prevent expensive plugin
   * remounts. Individual block objects maintain their own identity, so:
   * - Editing block A only causes Plugin A to receive new props
   * - Plugins B and C are unaffected (their block references unchanged)
   * - Adding/removing blocks only affects the added/removed plugins
   *
   * This approach properly isolates each plugin instance.
   */
  const storyBlocks = useMemo(
    () => selectedStory?.pages.flatMap((p) => p.blocks),
    [selectedStory?.pages]
  );

  const infoboxBlocks = useMemo(
    () => selectedLayer?.layer?.infobox?.blocks,
    [selectedLayer?.layer?.infobox?.blocks]
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
