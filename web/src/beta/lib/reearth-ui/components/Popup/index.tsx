import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  Placement,
  OffsetOptions,
  ShiftOptions,
} from "@floating-ui/react";
import { forwardRef, type HTMLProps, type ReactNode } from "react";
import { createContext, useContext } from "react";

import { Button } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import usePopover from "./hooks";

type ContextType = ReturnType<typeof usePopover> | null;

export const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = useContext(PopoverContext);

  if (context === null) {
    throw new Error("Popover components must be wrapped in <Popover.Root />");
  }
  return context;
};

type TriggerProps = {
  children?: ReactNode;
  disabled?: boolean;
};

const Trigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & TriggerProps>(
  function PopoverTrigger({ children, disabled, ...props }, propRef) {
    const context = usePopoverContext();
    const childrenRef = (children as any)?.ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    return (
      <TriggerWrapper disabled={disabled} ref={ref} {...context.getReferenceProps(props)}>
        {typeof children === "string" ? <Button title={children} /> : children}
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

export type PopupProps = {
  children?: ReactNode;
  trigger?: ReactNode;
  disabled?: boolean;
  placement?: Placement;
  open?: boolean;
  offset?: OffsetOptions;
  shift?: ShiftOptions;
  onOpenChange?: (open: boolean) => void;
};

export const Popup = ({ children, trigger, disabled, ...restOptions }: PopupProps) => {
  const popover = usePopover({ ...restOptions });

  return (
    <PopoverContext.Provider value={popover}>
      <Trigger disabled={disabled}>{trigger}</Trigger>
      <Content>{children}</Content>
    </PopoverContext.Provider>
  );
};

const TriggerWrapper = styled("div")<{ disabled?: boolean }>(({ disabled }) => ({
  width: "fit-content",
  pointerEvents: disabled ? "none" : "auto",
  flex: 1,
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.editor.popover,
}));
