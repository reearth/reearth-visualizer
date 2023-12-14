import { ReactNode } from "react";

import Icon from "@reearth/classic/components/atoms/Icon";
import { styled } from "@reearth/services/theme";

import useHooks, { type Direction, type Gutter } from "./hooks";

type Props = {
  children?: ReactNode;
  direction: Direction;
  gutter: Gutter;
  initialSize: number;
  minSize: number;
  maxSize?: number;
  localStorageKey?: string;
};

const Resizable: React.FC<Props> = ({
  direction,
  gutter,
  minSize,
  maxSize,
  initialSize,
  children,
  localStorageKey,
}) => {
  const { size, gutterProps, minimized, handleResetSize } = useHooks(
    direction,
    gutter,
    initialSize,
    minSize,
    maxSize,
    localStorageKey,
  );

  const showTopGutter = direction === "horizontal" && gutter === "start";
  const showRightGutter = direction === "vertical" && gutter === "end";
  const showBottomGutter = direction === "horizontal" && gutter === "end";
  const showLeftGutter = direction === "vertical" && gutter === "start";

  return (
    <>
      {minimized ? (
        <MinimizedWrapper direction={direction} onClick={handleResetSize}>
          <Icon
            icon={
              direction === "horizontal"
                ? gutter === "end"
                  ? "arrowDown"
                  : "arrowUp"
                : gutter === "end"
                ? "arrowRight"
                : "arrowLeft"
            }
          />
        </MinimizedWrapper>
      ) : (
        <StyledResizable direction={direction} size={size} minSize={minSize}>
          {showTopGutter && <Gutter direction={direction} gutter={gutter} {...gutterProps} />}
          {showLeftGutter && <Gutter direction={direction} gutter={gutter} {...gutterProps} />}
          {children}
          {showRightGutter && <Gutter direction={direction} gutter={gutter} {...gutterProps} />}
          {showBottomGutter && <Gutter direction={direction} gutter={gutter} {...gutterProps} />}
        </StyledResizable>
      )}
    </>
  );
};

const StyledResizable = styled.div<{
  direction: "vertical" | "horizontal";
  size: number;
  minSize?: number;
  maxSize?: number;
}>`
  display: flex;
  align-items: stretch;
  position: relative;
  flex-direction: ${({ direction }) => (direction === "vertical" ? "row" : "column")};
  width: ${({ direction, size }) => (direction === "horizontal" ? null : `${size}px`)};
  height: ${({ direction, size }) => (direction === "vertical" ? null : `${size}px`)};
  flex-shrink: 0;
  min-width: ${({ direction, minSize }) =>
    direction === "vertical" && minSize ? `${minSize}px` : null};
  min-height: ${({ direction, minSize }) =>
    direction === "horizontal" && minSize ? `${minSize}px` : null};
  max-width: ${({ direction, maxSize }) =>
    direction === "vertical" && maxSize ? `${maxSize}px` : null};
  max-height: ${({ direction, maxSize }) =>
    direction === "horizontal" && maxSize ? `${maxSize}px` : null};
`;

const Gutter = styled.div<{ direction: Direction; gutter: Gutter }>`
  user-select: none;
  position: absolute;
  ${({ direction }) => direction === "horizontal" && "height: 4px;"}
  ${({ direction }) => direction === "horizontal" && "width: 100%;"}
  ${({ direction }) => direction === "horizontal" && "cursor: row-resize;"}
  ${({ direction }) => direction === "vertical" && "height: 100%;"}
  ${({ direction }) => direction === "vertical" && "width: 4px;"}
  ${({ direction }) => direction === "vertical" && "cursor: col-resize;"}
  left: ${({ direction, gutter }) => (direction === "vertical" && gutter === "start" ? 0 : null)};
  right: ${({ direction, gutter }) => (direction === "vertical" && gutter === "end" ? 0 : null)};
  top: ${({ direction, gutter }) => (direction === "horizontal" && gutter === "start" ? 0 : null)};
  bottom: ${({ direction, gutter }) => (direction === "horizontal" && gutter === "end" ? 0 : null)};
`;

const MinimizedWrapper = styled.div<Pick<Props, "direction">>`
  display: flex;
  flex-direction: ${({ direction }) => (direction === "horizontal" ? "column" : "row")};
  align-items: center;
  width: ${({ direction }) => (direction === "horizontal" ? null : `20px`)};
  height: ${({ direction }) => (direction === "vertical" ? null : `20px`)};
  background: ${({ theme }) => theme.bg[0]};
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: ${({ theme }) => theme.bg[1]};
  }
}`;

export default Resizable;
