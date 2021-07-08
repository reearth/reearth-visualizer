import { useCallback, useState } from "react";
import { useLocalState } from "@reearth/state";

export type Tab = "layer" | "scene" | "widget" | "infobox" | "export";

export default () => {
  const [{ selectedLayerType, isCapturing, selectedLayerId, selectedBlock }, setLocalState] =
    useLocalState(s => ({
      selectedLayerType: s.selectedType,
      selectedLayerId: s.selectedLayer,
      isCapturing: s.isCapturing,
      selectedBlock: s.selectedBlock,
    }));

  const [selectedTab, setSelectedTab] = useState<Tab>();

  const reset = useCallback(
    (t: Tab) => {
      setSelectedTab(t);
      setLocalState({ selectedBlock: undefined });
    },
    [setLocalState],
  );

  return {
    selectedTab,
    setSelectedTab,
    reset,
    selectedLayerType,
    selectedLayerId,
    isCapturing,
    selectedBlock,
  };
};
