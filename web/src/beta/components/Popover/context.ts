import { createContext, useContext } from "react";

import usePopover from "@reearth/beta/components/Popover/hooks";

type ContextType = ReturnType<typeof usePopover> | null;

export const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = useContext(PopoverContext);

  if (context === null) {
    throw new Error("Popover components must be wrapped in <Popover.Root />");
  }

  return context;
};
