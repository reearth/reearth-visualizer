import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  useTransitionStyles,
} from "@floating-ui/react";
import {
  forwardRef,
  isValidElement,
  cloneElement,
  MutableRefObject,
  type ButtonHTMLAttributes,
  type HTMLProps,
  type ReactNode,
} from "react";

import { PopoverContext, usePopoverContext } from "@reearth/beta/components/Popover/context";
import { useTheme } from "@reearth/services/theme";

import usePopover from "./hooks";
import { PopoverOptions } from "./types";

// Basic structure comes from official example https://floating-ui.com/docs/react-examples .
export function Provider({
  children,
  modal = false,
  ...restOptions
}: {
  children: ReactNode;
} & PopoverOptions) {
  const popover = usePopover({ modal, ...restOptions });
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
}

type TriggerProps = {
  className?: string;
  children: ReactNode;
  asChild?: boolean;
};

export const Trigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & TriggerProps>(
  function Trigger({ children, asChild = false, className, ...props }, propRef) {
    const context = usePopoverContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
      return cloneElement(
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
  attachToRoot?: boolean;
};

export const Content = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement> & ContentProps>(
  function Content({ style, className, attachToRoot = false, ...props }, propRef) {
    const { context: floatingContext, ...context } = usePopoverContext();
    const theme = useTheme();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);
    const { isMounted, styles: transitionStyles } = useTransitionStyles(floatingContext, {
      duration: 50,
    });

    if (!isMounted) return null;

    return (
      <FloatingPortal
        // whether to render this inside the Trigger or outside the main div
        root={attachToRoot ? (context.refs.domReference as MutableRefObject<null>) : null}>
        <FloatingFocusManager context={floatingContext} modal={context.modal} initialFocus={-1}>
          <div
            ref={ref}
            className={className}
            style={{
              ...context.floatingStyles,
              ...transitionStyles,
              ...style,
              zIndex: theme.zIndexes.editor.popover,
            }}
            {...context.getFloatingProps(props)}>
            {props.children}
          </div>
        </FloatingFocusManager>
      </FloatingPortal>
    );
  },
);

export const Close = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function PopoverClose(props, ref) {
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
  },
);
