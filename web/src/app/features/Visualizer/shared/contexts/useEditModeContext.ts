import { useContext } from "react";

import { EditModeContext, EditModeContextType } from "./editModeContext";

export const useEditModeContext = (): EditModeContextType => {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("Could not find EditModeProvider");
  }

  return ctx;
};
