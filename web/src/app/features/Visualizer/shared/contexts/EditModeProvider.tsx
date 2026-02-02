import { FC, PropsWithChildren } from "react";

import { EditModeContext, EditModeContextType } from "./editModeContext";

export const EditModeProvider: FC<
  PropsWithChildren<{ value: EditModeContextType }>
> = ({ children, value }) => (
  <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
);
