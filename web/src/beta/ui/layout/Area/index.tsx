import { IconButton } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

import { Panel } from "../Panel";

type ResizableEdge = "top" | "right" | "bottom" | "left";

export type AreaSize = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type AreaProps = {
  direction?: "row" | "column";
  initialWidth?: number;
  initialHeight?: number;
  extend?: boolean;
  hidden?: boolean;
  backgroundColor?: string;
  resizableEdge?: ResizableEdge;
  resizeHandleColor?: string;
  windowRef?: RefObject<HTMLDivElement>;
  asWrapper?: boolean;
  storageId?: string;
  passive?: boolean;
  children?: ReactNode;
  onResize?: (props: AreaSize) => void;
};

export type AreaRef = {
  collapse: () => void;
};

const DEFAULT_WIDTH = 308;
const DEFAULT_MIN_WIDTH = 200;
const DEFAULT_COLLAPSE_WIDTH = 100;

const DEFAULT_HEIGHT = 200;
const DEFAULT_MIN_HEIGHT = 136;
const DEFAULT_COLLAPSE_HEIGHT = 70;

const COLLAPSED_SIZE = 22;

export const Area = forwardRef<AreaRef, AreaProps>(
  (
    {
      direction = "row",
      initialWidth,
      initialHeight,
      backgroundColor,
      resizableEdge,
      resizeHandleColor,
      extend,
      hidden,
      windowRef,
      asWrapper,
      storageId,
      passive,
      children,
      onResize
    },
    ref
  ) => {
    const sizeStorageKey = storageId
      ? `reearth-visualizer-${storageId}-size`
      : undefined;
    const collapsedStorageKey = storageId
      ? `reearth-visualizer-${storageId}-collapsed`
      : undefined;

    const [size, setSize] = useState({
      width: Number(
        (sizeStorageKey && direction === "column"
          ? localStorage.getItem(sizeStorageKey)
          : undefined) ??
          initialWidth ??
          DEFAULT_WIDTH
      ),
      height: Number(
        (sizeStorageKey && direction === "row"
          ? localStorage.getItem(sizeStorageKey)
          : undefined) ??
          initialHeight ??
          DEFAULT_HEIGHT
      )
    });

    const [collapsed, setCollapsed] = useState<boolean>(
      collapsedStorageKey
        ? localStorage.getItem(collapsedStorageKey) === "1"
        : false
    );

    const resizableRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState<boolean>(false);

    const handleMouseDown = useCallback((e: ReactMouseEvent) => {
      setIsResizing(true);
      e.preventDefault();
    }, []);

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isResizing || !resizableRef.current) return;

        const rect = resizableRef.current.getBoundingClientRect();

        setSize((prevSize) => {
          let width =
            resizableEdge === "right"
              ? e.clientX - rect.left + 1
              : resizableEdge === "left"
                ? rect.right - e.clientX + 1
                : prevSize.width;

          let height =
            resizableEdge === "bottom"
              ? e.clientY - rect.top + 1
              : resizableEdge === "top"
                ? rect.bottom - e.clientY + 1
                : prevSize.height;

          if (
            (resizableEdge === "left" || resizableEdge === "right") &&
            width < DEFAULT_MIN_WIDTH &&
            width > DEFAULT_COLLAPSE_WIDTH
          ) {
            return prevSize;
          }

          if (
            (resizableEdge === "top" || resizableEdge === "bottom") &&
            height < DEFAULT_MIN_HEIGHT &&
            height > DEFAULT_COLLAPSE_HEIGHT
          ) {
            return prevSize;
          }

          if (
            (resizableEdge === "left" || resizableEdge === "right") &&
            width <= DEFAULT_COLLAPSE_WIDTH
          ) {
            setCollapsed(true);
            if (collapsedStorageKey) {
              localStorage.setItem(collapsedStorageKey, "1");
            }
            setIsResizing(false);
            width = COLLAPSED_SIZE;
          }

          if (
            (resizableEdge === "top" || resizableEdge === "bottom") &&
            height <= DEFAULT_COLLAPSE_HEIGHT
          ) {
            setCollapsed(true);
            if (collapsedStorageKey) {
              localStorage.setItem(collapsedStorageKey, "1");
            }
            setIsResizing(false);
            height = COLLAPSED_SIZE;
          }

          if (sizeStorageKey) {
            localStorage.setItem(
              sizeStorageKey,
              direction === "row" ? height.toString() : width.toString()
            );
          }

          return {
            width,
            height
          };
        });
      },
      [
        isResizing,
        resizableEdge,
        sizeStorageKey,
        collapsedStorageKey,
        direction
      ]
    );

    const onMouseUp = () => {
      setIsResizing(false);
    };

    useEffect(() => {
      if (isResizing) {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      } else {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [isResizing, onMouseMove]);

    useEffect(() => {
      if (!onResize) return;
      const area = resizableRef.current;
      if (!area) return;
      const areaObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        const areaRect = resizableRef.current?.getBoundingClientRect();
        const windowRect = windowRef?.current?.getBoundingClientRect();
        const top = areaRect && windowRect ? areaRect.top - windowRect.top : 0;
        const left =
          areaRect && windowRect ? areaRect.left - windowRect.left : 0;
        onResize({ width, height, top, left });
      });
      areaObserver.observe(area);
      return () => {
        areaObserver.unobserve(area);
        areaObserver.disconnect();
      };
    }, [windowRef, onResize]);

    const isValidEdge = useMemo(
      () =>
        (direction === "row" &&
          (resizableEdge === "top" || resizableEdge === "bottom")) ||
        (direction === "column" &&
          (resizableEdge === "left" || resizableEdge === "right")),
      [direction, resizableEdge]
    );

    const uncollapse = useCallback(() => {
      setCollapsed(false);
      if (collapsedStorageKey) {
        localStorage.setItem(collapsedStorageKey, "0");
      }
      setSize((prevSize) => {
        const w =
          direction === "column"
            ? (initialWidth ?? DEFAULT_WIDTH)
            : prevSize.width;
        const h =
          direction === "row"
            ? (initialHeight ?? DEFAULT_HEIGHT)
            : prevSize.height;

        if (sizeStorageKey) {
          localStorage.setItem(
            sizeStorageKey,
            direction === "row" ? h.toString() : w.toString()
          );
        }

        return {
          width: w,
          height: h
        };
      });
    }, [
      direction,
      sizeStorageKey,
      collapsedStorageKey,
      initialWidth,
      initialHeight
    ]);

    const collapse = useCallback(() => {
      setCollapsed(true);
      if (collapsedStorageKey) {
        localStorage.setItem(collapsedStorageKey, "1");
      }
      setSize((prevSize) => {
        const width = direction === "column" ? COLLAPSED_SIZE : prevSize.width;
        const height = direction === "row" ? COLLAPSED_SIZE : prevSize.height;

        if (sizeStorageKey) {
          localStorage.setItem(
            sizeStorageKey,
            direction === "row" ? height.toString() : width.toString()
          );
        }

        return {
          width,
          height
        };
      });
    }, [direction, collapsedStorageKey, sizeStorageKey]);

    useImperativeHandle(ref, () => ({
      collapse() {
        collapse();
      }
    }));

    return (
      <StyledArea
        ref={resizableRef}
        direction={direction}
        extend={extend}
        hidden={hidden}
        width={size.width}
        height={size.height}
        backgroundColor={backgroundColor}
        asWrapper={asWrapper}
        passive={passive}
      >
        {!collapsed && children}
        {resizableEdge && isValidEdge && !collapsed && (
          <ResizeHandle
            data-testid="resize-handle"
            edge={resizableEdge}
            color={resizeHandleColor}
            onMouseDown={handleMouseDown}
          />
        )}
        {collapsed && (
          <Panel extend background={backgroundColor}>
            <StyledIconButton
              icon="arrowsHorizontalOut"
              size="small"
              appearance="simple"
              vertical={resizableEdge === "top" || resizableEdge === "bottom"}
              onClick={uncollapse}
            />
          </Panel>
        )}
      </StyledArea>
    );
  }
);

Area.displayName = "Area";

const StyledArea = styled("div")<{
  direction?: "row" | "column";
  extend?: boolean;
  hidden?: boolean;
  width: number;
  height: number;
  backgroundColor?: string;
  asWrapper?: boolean;
  passive?: boolean;
}>(
  ({
    theme,
    direction,
    extend,
    hidden,
    width,
    height,
    backgroundColor,
    asWrapper,
    passive
  }) => ({
    position: "relative",
    display: hidden ? "none" : "flex",
    flexDirection: direction,
    justifyContent: "space-between",
    height: direction === "row" && !extend ? height : "100%",
    width: direction === "column" && !extend ? width : "100%",
    flexGrow: extend ? 1 : 0,
    flexShrink: extend ? 1 : 0,
    overflow: "hidden",
    backgroundColor: backgroundColor
      ? backgroundColor
      : asWrapper || passive
        ? "transparent"
        : theme.bg.base,
    boxSizing: "border-box",
    pointerEvents: asWrapper || passive ? "none" : "auto",
    ...(!asWrapper && {
      padding: theme.spacing.micro / 2,
      gap: theme.spacing.micro,
      flexDirection: direction
    }),
    maxHeight: "100%",
    maxWidth: "100%"
  })
);

const ResizeHandle = styled("div")<{ edge: ResizableEdge; color?: string }>(
  ({ edge, color }) => ({
    position: "absolute",
    width: edge === "left" || edge === "right" ? 4 : "100%",
    height: edge === "top" || edge === "bottom" ? 4 : "100%",
    left: edge === "right" ? "calc(100% - 4px)" : edge === "left" ? "0" : 0,
    top: edge === "bottom" ? "calc(100% - 4px)" : edge === "top" ? "0" : 0,
    cursor: edge === "right" || edge === "left" ? "ew-resize" : "ns-resize",
    zIndex: 1,
    background: color ?? "none"
  })
);

const StyledIconButton = styled(IconButton)<{ vertical?: boolean }>(
  ({ vertical }) => ({
    height: "100%",
    width: "100%",
    ["svg"]: {
      transform: vertical ? "rotate(90deg)" : "none"
    }
  })
);

export const Window = styled("div")(({ theme }) => ({
  flex: 1,
  width: "100%",
  height: "100%",
  padding: 1,
  boxSizing: "border-box",
  ["*"]: {
    boxSizing: "border-box"
  },
  ...theme.scrollBar
}));
