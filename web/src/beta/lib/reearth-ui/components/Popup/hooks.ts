import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  useHover,
  safePolygon,
  arrow
} from "@floating-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";

import { PopupProps } from ".";

const usePopover = ({
  placement = "bottom",
  open: controlledOpen,
  offset: offsetProps,
  shift: shiftProps,
  onOpenChange,
  triggerOnHover = false
}: Omit<PopupProps, "children" | "trigger">) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const arrowRef = useRef(null);

  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }

      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetProps),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "start"
      }),
      shift(shiftProps),
      arrow({ element: arrowRef })
    ]
  });

  const context = data.context;

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const hover = useHover(context, {
    enabled: triggerOnHover,
    handleClose: safePolygon()
  });

  const interactions = useInteractions([hover, click, dismiss]);

  return useMemo(
    () => ({
      open,
      setOpen,
      arrowRef,
      ...interactions,
      ...data
    }),
    [open, setOpen, interactions, data]
  );
};

export default usePopover;
