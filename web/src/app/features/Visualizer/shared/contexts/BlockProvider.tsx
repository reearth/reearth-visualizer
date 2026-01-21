import { FC, PropsWithChildren } from "react";

import { BlockContext, BlockContextType } from "./blockContext";

export const BlockProvider: FC<
  PropsWithChildren<{ value: BlockContextType }>
> = ({ children, value }) => (
  <BlockContext.Provider value={value}>{children}</BlockContext.Provider>
);
