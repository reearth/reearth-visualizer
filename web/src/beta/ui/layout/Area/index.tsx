import {
  FC,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { styled } from "@reearth/services/theme";

type ResizableEdge = "top" | "right" | "bottom" | "left";

export type AreaSize = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type AreaProps = {
  direction?: "row" | "column";
  width?: number;
  height?: number;
  extend?: boolean;
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

const DEFAULT_SIZE = 300;

export const Area: FC<AreaProps> = ({
  direction = "row",
  width,
  height,
  backgroundColor,
  resizableEdge,
  resizeHandleColor,
  extend,
  windowRef,
  asWrapper,
  storageId,
  passive,
  children,
  onResize,
}) => {
  const storageKey = storageId ? `reearth-visualizer-${storageId}-size` : undefined;

  const [size, setSize] = useState({
    width: Number(
      (storageKey && direction === "column" ? localStorage.getItem(storageKey) : undefined) ??
        width ??
        DEFAULT_SIZE,
    ),
    height: Number(
      (storageKey && direction === "row" ? localStorage.getItem(storageKey) : undefined) ??
        height ??
        DEFAULT_SIZE,
    ),
  });

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

      setSize(prevSize => {
        const width =
          resizableEdge === "right"
            ? e.clientX - rect.left + 1
            : resizableEdge === "left"
            ? rect.right - e.clientX + 1
            : prevSize.width;
        const height =
          resizableEdge === "bottom"
            ? e.clientY - rect.top + 1
            : resizableEdge === "top"
            ? rect.bottom - e.clientY + 1
            : prevSize.height;
        if (storageKey) {
          localStorage.setItem(
            storageKey,
            direction === "row" ? height.toString() : width.toString(),
          );
        }
        return {
          width,
          height,
        };
      });
    },
    [isResizing, resizableEdge, storageKey, direction],
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
    const areaObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      const areaRect = resizableRef.current?.getBoundingClientRect();
      const windowRect = windowRef?.current?.getBoundingClientRect();
      const top = areaRect && windowRect ? areaRect.top - windowRect.top : 0;
      const left = areaRect && windowRect ? areaRect.left - windowRect.left : 0;
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
      (direction === "row" && (resizableEdge === "top" || resizableEdge === "bottom")) ||
      (direction === "column" && (resizableEdge === "left" || resizableEdge === "right")),
    [direction, resizableEdge],
  );

  return (
    <StyledArea
      ref={resizableRef}
      direction={direction}
      extend={extend}
      width={size.width}
      height={size.height}
      backgroundColor={backgroundColor}
      asWrapper={asWrapper}
      passive={passive}>
      {children}
      {resizableEdge && isValidEdge && (
        <ResizeHandle
          edge={resizableEdge}
          color={resizeHandleColor}
          onMouseDown={handleMouseDown}
        />
      )}
    </StyledArea>
  );
};

const StyledArea = styled("div")<{
  direction?: "row" | "column";
  extend?: boolean;
  width: number;
  height: number;
  backgroundColor?: string;
  asWrapper?: boolean;
  passive?: boolean;
}>(({ theme, direction, extend, width, height, backgroundColor, asWrapper, passive }) => ({
  position: "relative",
  display: "flex",
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
    display: "flex",
    flexDirection: direction,
  }),
  maxHeight: "100%",
  maxWidth: "100%",
}));

const ResizeHandle = styled("div")<{ edge: ResizableEdge; color?: string }>(({ edge, color }) => ({
  position: "absolute",
  width: edge === "left" || edge === "right" ? 5 : "100%",
  height: edge === "top" || edge === "bottom" ? 5 : "100%",
  left: edge === "right" ? "calc(100% - 5px)" : edge === "left" ? "0" : 0,
  top: edge === "bottom" ? "calc(100% - 5px)" : edge === "top" ? "0" : 0,
  cursor: edge === "right" || edge === "left" ? "ew-resize" : "ns-resize",
  zIndex: 1,
  background: color ?? "none",
}));

export const Window = styled("div")(() => ({
  flex: 1,
  width: "100%",
  height: "100%",
  padding: 1,
  boxSizing: "border-box",
  ["*"]: {
    boxSizing: "border-box",
  },
}));
