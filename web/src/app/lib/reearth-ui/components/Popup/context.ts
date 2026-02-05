import { createContext } from "react";

import { usePopover } from "./hooks";

type ContextType = ReturnType<typeof usePopover> | null;

export const PopoverContext = createContext<ContextType>(null);
