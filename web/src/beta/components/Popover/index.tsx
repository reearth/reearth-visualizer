import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  useTransitionStyles,
} from "@floating-ui/react";
import * as React from "react";

import { PopoverContext, usePopoverContext } from "@reearth/beta/components/Popover/context";

import usePopover from "./hooks";
import { PopoverOptions } from "./types";

// Basic structure comes from official example https://floating-ui.com/docs/react-examples .
export function Provider({
  children,
  modal = false,
  ...restOptions
}: {
  children: React.ReactNode;
} & PopoverOptions) {
  const popover = usePopover({ modal, ...restOptions });
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
}

type TriggerProps = {
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
};

export const Trigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & TriggerProps>(
  function Trigger({ children, asChild = false, className, ...props }, propRef) {
    const context = usePopoverContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...children.props,
          "data-state": context.open ? "open" : "closed",
        }),
      );
    }

    return (
      <button
        ref={ref}
        className={className}
        type="button"
        // The user can style the trigger based on the state
        data-state={context.open ? "open" : "closed"}
        {...context.getReferenceProps(props)}>
        {children}
      </button>
    );
  },
);

type ContentProps = {
  className?: string;
};

export const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement> & ContentProps
>(function Content({ style, className, ...props }, propRef) {
  const { context: floatingContext, ...context } = usePopoverContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(floatingContext, {
    duration: 50,
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <div
          ref={ref}
          className={className}
          style={{ ...context.floatingStyles, ...transitionStyles, ...style }}
          {...context.getFloatingProps(props)}>
          {props.children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});

export const Close = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function PopoverClose(props, ref) {
  const { setOpen } = usePopoverContext();
  return (
    <button
      type="button"
      ref={ref}
      {...props}
      onClick={event => {
        props.onClick?.(event);
        setOpen(false);
      }}
    />
  );
});
