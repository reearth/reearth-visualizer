import { createContext } from "react";

export type EditModeContextType = {
  disableSelection?: boolean;
  onSelectionDisable?: (disabled?: boolean) => void;
};

export const EditModeContext = createContext<EditModeContextType | undefined>(
  undefined
);
