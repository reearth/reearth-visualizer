import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { useMemo, useState } from "react";

import { PopupProps } from ".";

const usePopover = ({
  placement = "bottom",
  open: controlledOpen,
  offset: offsetProps,
  shift: shiftProps,
  onOpenChange: setControlledOpen,
}: Omit<PopupProps, "children" | "trigger">) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetProps),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "start",
      }),
      shift(shiftProps),
    ],
  });

  const context = data.context;

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const interactions = useInteractions([click, dismiss]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data],
  );
};

export default usePopover;
