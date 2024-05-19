import {
  Placement,
  OffsetOptions,
  ShiftOptions,
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import {
  HTMLProps,
  ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
} from "react";

import { Button } from "@reearth/beta/lib/reearth-ui/components/Button";
import { fonts, styled } from "@reearth/services/theme";

import usePopover from "./hook";

export type PopupOptionsProps = {
  placement?: Placement;
  modal?: boolean;
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

export const Provider = ({
  children,
  modal = false,
  ...restOptions
}: {
  children: ReactNode;
} & PopupOptionsProps) => {
  const popover = usePopover({ modal, ...restOptions });
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};

export type TriggerProps = {
  children?: ReactNode;
  asChild?: boolean;
  title?: string;
};

export const Trigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & TriggerProps>(
  function PopoverTrigger({ children, title, asChild = false, ...props }, propRef) {
    const context = usePopoverContext();
    const childrenRef = (children as any)?.ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);
    const { setOpen, open } = usePopoverContext();

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...children.props,
        }),
      );
    }

    return (
      <TriggerWrapper ref={ref} {...context.getReferenceProps(props)}>
        <Button title={title} onClick={() => setOpen(open)} />
      </TriggerWrapper>
    );
  },
);

type ContentProps = {
  title?: string;
  onClick?: () => void;
};

export const Content = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement> & ContentProps>(
  function PopoverContent({ children, title, onClick, style, ...props }, propRef) {
    const { context: floatingContext, ...context } = usePopoverContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
      <FloatingPortal>
        <FloatingFocusManager context={floatingContext} modal={context.modal}>
          <ContentWrapper
            ref={ref}
            style={{ ...context.floatingStyles, ...style }}
            {...context.getFloatingProps(props)}>
            {title ? (
              <ContentWithHeader>
                <HeaderWrapper>
                  {/* TODD: Use Text Component */}
                  <Title>{title}</Title>
                  {/* TODD: Use Icon Component based on icon */}
                  <CloseIcon onClick={onClick}>Icon</CloseIcon>
                </HeaderWrapper>
                {children}
              </ContentWithHeader>
            ) : (
              children
            )}
          </ContentWrapper>
        </FloatingFocusManager>
      </FloatingPortal>
    );
  },
);

const TriggerWrapper = styled("div")(() => ({
  display: "flex",
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.editor.popover,
}));

const ContentWithHeader = styled("div")(({ theme }) => ({
  width: "286px",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  boxShadow: theme.shadow.popup,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing.normal,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderBottom: `1px solid ${theme.outline.weak}`,
}));

const CloseIcon = styled("div")(() => ({
  marginLeft: "auto",
  cursor: "pointer",
}));

const Title = styled("div")(() => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));
