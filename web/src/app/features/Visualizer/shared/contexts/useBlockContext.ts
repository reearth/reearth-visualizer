import { useContext } from "react";

import { BlockContext, BlockContextType } from "./blockContext";

export const useBlockContext = (): BlockContextType => {
  const ctx = useContext(BlockContext);
  if (!ctx) {
    throw new Error("Could not find BlockContextProvider");
  }

  return ctx;
};
