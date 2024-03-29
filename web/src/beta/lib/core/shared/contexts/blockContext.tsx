import { createContext, FC, PropsWithChildren, useContext } from "react";

export type BlockContext = {
  layerOverride?: { extensionId: string; layerIds?: string[] };
  onLayerOverride?: (id?: string, layerIds?: string[]) => void;
};

const BlockContext = createContext<BlockContext | undefined>(undefined);

export const BlockProvider: FC<PropsWithChildren<{ value: BlockContext }>> = ({
  children,
  value,
}) => <BlockContext.Provider value={value}>{children}</BlockContext.Provider>;

export const useBlockContext = (): BlockContext => {
  const ctx = useContext(BlockContext);
  if (!ctx) {
    throw new Error("Could not find BlockProvider");
  }

  return ctx;
};
