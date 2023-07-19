import { Placement, OffsetOptions } from "@floating-ui/react";

export type PopoverOptions = {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean; // @see https://floating-ui.com/docs/floatingfocusmanager#modal
  open?: boolean;
  offset?: OffsetOptions; // @see https://floating-ui.com/docs/offset
  onOpenChange?: (open: boolean) => void;
};
