import { createContext } from "react";

export type BlockContextType = {
  layerOverride?: { extensionId: string; layerIds?: string[] };
  onLayerOverride?: (id?: string, layerIds?: string[]) => void;
};

export const BlockContext = createContext<BlockContextType | undefined>(
  undefined
);
