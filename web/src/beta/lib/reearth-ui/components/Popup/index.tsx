import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  Placement,
  OffsetOptions,
  ShiftOptions,
} from "@floating-ui/react";
import { forwardRef, isValidElement, cloneElement, type HTMLProps, type ReactNode } from "react";
import { createContext, useContext } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui/components/Button";
import { styled } from "@reearth/services/theme";

import usePopover from "./hooks";

export type PopupOptionsProps = {
  placement?: Placement;
  open?: boolean;
  offset?: OffsetOptions;
  shift?: ShiftOptions;
  onOpenChange?: (open: boolean) => void;
};

type ContextType = ReturnType<typeof usePopover> | null;

export const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = useContext(PopoverContext);

  if (context === null) {
    throw new Error("Popover components must be wrapped in <Popover.Root />");
  }
  return context;
};

export type TriggerProps = {
  children?: ReactNode;
  asChild?: boolean;
  title?: string;
};

const Trigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & TriggerProps>(
  function PopoverTrigger({ children, title, asChild = false, ...props }, propRef) {
    const context = usePopoverContext();
    const childrenRef = (children as any)?.ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...children.props,
          style: { width: "fit-content" },
        }),
      );
    }

    return (
      <TriggerWrapper ref={ref} {...context.getReferenceProps(props)}>
        <Button title={title} />
      </TriggerWrapper>
    );
  },
);

const Content = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(function Content(
  { style, ...props },
  propRef,
) {
  const { context: floatingContext, ...context } = usePopoverContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);
  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext}>
        <ContentWrapper
          ref={ref}
          style={{
            ...context.floatingStyles,
            ...style,
          }}
          {...context.getFloatingProps(props)}>
          {props.children}
        </ContentWrapper>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});
const TriggerWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
  width: "fit-content",
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.editor.popover,
}));

export type PopupProps = {
  children?: ReactNode;
  trigger?: ReactNode;
  asChild?: boolean;
  title?: string;
  placement?: Placement;
  open?: boolean;
  offset?: OffsetOptions;
  shift?: ShiftOptions;
  onOpenChange?: (open: boolean) => void;
};

export const Popup = ({ children, trigger, asChild, title, ...restOptions }: PopupProps) => {
  const popover = usePopover({ ...restOptions });

  return (
    <PopoverContext.Provider value={popover}>
      <Trigger asChild={asChild} title={title}>
        {trigger}
      </Trigger>
      <Content>{children}</Content>
    </PopoverContext.Provider>
  );
};
