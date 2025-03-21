import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  Placement,
  OffsetOptions,
  ShiftOptions,
  FloatingArrow
} from "@floating-ui/react";
import { Button } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import {
  forwardRef,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLProps,
  type ReactNode
} from "react";
import { createContext, useContext } from "react";

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
  extendWidth?: boolean;
};

const Trigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & TriggerProps>(
  function PopoverTrigger(
    { children, disabled, extendWidth, ...props },
    propRef
  ) {
    const context = usePopoverContext();
    const childrenRef = (children as any)?.ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    return (
      <TriggerWrapper
        disabled={disabled}
        extendWidth={extendWidth}
        ref={ref}
        {...context.getReferenceProps(props)}
      >
        {typeof children === "string" ? <Button title={children} /> : children}
      </TriggerWrapper>
    );
  }
);

const Content = forwardRef<
  HTMLDivElement,
  HTMLProps<HTMLDivElement> & { tooltip?: boolean }
>(function Content({ style, tooltip, ...props }, propRef) {
  const { context: floatingContext, ...context } = usePopoverContext();

  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const theme = useTheme();

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext}>
        <ContentWrapper
          ref={ref}
          style={{
            ...context.floatingStyles,
            ...style
          }}
          {...context.getFloatingProps(props)}
        >
          {tooltip && (
            <FloatingArrow
              ref={context.arrowRef}
              context={floatingContext}
              style={{
                fill: theme.bg[2]
              }}
              width={8}
              height={6}
            />
          )}

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
  triggerOnHover?: boolean;
  extendTriggerWidth?: boolean;
  extendContentWidth?: boolean;
  autoClose?: boolean;
  placement?: Placement;
  open?: boolean;
  offset?: OffsetOptions;
  shift?: ShiftOptions;
  nested?: boolean;
  tooltip?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const Popup = ({
  children,
  trigger,
  disabled,
  triggerOnHover,
  extendTriggerWidth,
  extendContentWidth,
  autoClose,
  tooltip,
  ...restOptions
}: PopupProps) => {
  const popover = usePopover({ ...restOptions, triggerOnHover });

  const handleAutoClose = useCallback(() => {
    if (autoClose && popover.open) {
      popover.setOpen(false);
    }
  }, [autoClose, popover]);

  const triggerRef = useRef<HTMLElement>(null);

  const [extendedWidth, setExtendedWidth] = useState(0);

  useEffect(() => {
    const currentTrigger = triggerRef.current;
    if (!currentTrigger) return;
    const observer = new ResizeObserver(() => {
      setExtendedWidth(currentTrigger.clientWidth ?? 0);
    });
    observer.observe(currentTrigger);
    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRef.current]);

  const contentStyle = useMemo(
    () => (extendContentWidth ? { width: extendedWidth } : {}),
    [extendContentWidth, extendedWidth]
  );

  const handleContentClick = useCallback(
    (e: SyntheticEvent) => {
      if (tooltip) {
        e.stopPropagation();
        return;
      }
      handleAutoClose();
    },
    [handleAutoClose, tooltip]
  );

  return (
    <PopoverContext.Provider value={{ ...popover, setOpen: popover.setOpen }}>
      <Trigger
        ref={triggerRef}
        disabled={disabled}
        extendWidth={extendTriggerWidth}
      >
        {trigger}
      </Trigger>
      <Content
        tooltip={tooltip}
        onClick={handleContentClick}
        style={contentStyle}
      >
        {children}
      </Content>
    </PopoverContext.Provider>
  );
};

const TriggerWrapper = styled("div")<{
  disabled?: boolean;
  extendWidth?: boolean;
}>(({ disabled, extendWidth }) => ({
  width: extendWidth ? "100%" : "fit-content",
  pointerEvents: disabled ? "none" : "auto"
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.editor.popover
}));
