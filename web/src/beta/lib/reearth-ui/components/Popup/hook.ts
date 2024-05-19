import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
} from "@floating-ui/react";
import { useMemo, useState } from "react";

import { PopupOptionsProps } from ".";

const usePopover = ({
  placement = "bottom",
  modal,
  open: controlledOpen,
  offset: offsetProps,
  shift: shiftProps,
  onOpenChange: setControlledOpen,
}: PopupOptionsProps = {}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetProps ?? 4),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "start",
        padding: 4,
      }),
      shift(shiftProps ?? { padding: 4 }),
    ],
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      modal,
    }),
    [open, setOpen, interactions, data, modal],
  );
};

export default usePopover;
