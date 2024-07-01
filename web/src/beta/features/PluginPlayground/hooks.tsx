import { useMemo } from "react";

import { TabItem } from "@reearth/beta/lib/reearth-ui";

import Console from "./Console";
import PluginInspector from "./PluginInspector";
import Plugins from "./Plugins";
import Viewer from "./Viewer";

export default () => {
  // Note: currently we put visualizer in tab content, so better not have more tabs in this area,
  // otherwise visualizer will got unmount and mount when switching tabs.
  const MainAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "viewer",
        name: "Viewer",
        children: <Viewer />,
      },
    ],
    [],
  );

  const BottomAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "console",
        name: "Console",
        children: <Console />,
      },
    ],
    [],
  );

  const SubRightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "plugins",
        name: "Plugins",
        children: <Plugins />,
      },
    ],
    [],
  );

  const RightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "plugin-inspector",
        name: "Plugin Inspector",
        children: <PluginInspector />,
      },
    ],
    [],
  );

  return {
    MainAreaTabs,
    BottomAreaTabs,
    SubRightAreaTabs,
    RightAreaTabs,
  };
};
