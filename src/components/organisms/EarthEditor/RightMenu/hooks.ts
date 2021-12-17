import { useCallback, useEffect, useState } from "react";

import { useSelected, useSelectedBlock, useIsCapturing } from "@reearth/state";

export type Tab =
  | "layer"
  | "scene"
  | "widget"
  | "widgets"
  | "infobox"
  | "export"
  | "dataset"
  | "cluster";

export default () => {
  const [selected] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [isCapturing] = useIsCapturing();

  const [selectedTab, setSelectedTab] = useState<Tab>();

  const reset = useCallback(
    (t: Tab) => {
      setSelectedTab(t);
      selectBlock(undefined);
    },
    [selectBlock],
  );

  useEffect(() => {
    setSelectedTab(selected?.type);
  }, [selected?.type, setSelectedTab]);

  useEffect(() => {
    if (!selectedBlock) return;
    setSelectedTab("infobox");
  }, [selectedBlock, setSelectedTab]);

  return {
    selectedTab,
    selected: selected?.type || "scene",
    isCapturing,
    selectedBlock,
    setSelectedTab,
    reset,
  };
};
