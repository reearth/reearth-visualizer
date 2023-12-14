import { createContext, FC, PropsWithChildren, useContext } from "react";

export type StoryPanelContext = {
  pageIds?: string[];
  layerOverride?: { extensionId: string; layerIds?: string[] };
  disableSelection?: boolean;
  onSelectionDisable?: (disabled?: boolean) => void;
  onLayerOverride?: (id?: string, layerIds?: string[]) => void;
  onJumpToPage?: (newPageIndex: number) => void;
};

const PanelContext = createContext<StoryPanelContext | undefined>(undefined);

export const PanelProvider: FC<PropsWithChildren<{ value: StoryPanelContext }>> = ({
  children,
  value,
}) => <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;

export const usePanelContext = (): StoryPanelContext => {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("Could not find PanelProvider");
  }

  return ctx;
};
