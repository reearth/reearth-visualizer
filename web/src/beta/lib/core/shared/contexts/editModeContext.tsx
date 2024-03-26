import { createContext, FC, PropsWithChildren, useContext } from "react";

export type EditModeContext = {
  disableSelection?: boolean;
  onSelectionDisable?: (disabled?: boolean) => void;
};

const EditModeContext = createContext<EditModeContext | undefined>(undefined);

export const EditModeProvider: FC<PropsWithChildren<{ value: EditModeContext }>> = ({
  children,
  value,
}) => <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;

export const useEditModeContext = (): EditModeContext => {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("Could not find EditModeProvider");
  }

  return ctx;
};
