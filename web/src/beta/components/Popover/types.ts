import { Placement } from "@floating-ui/react";

export type PopoverOptions = {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean; // @see https://floating-ui.com/docs/floatingfocusmanager#modal
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
