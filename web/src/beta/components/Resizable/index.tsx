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
};

const Resizable: React.FC<Props> = ({ direction, gutter, minSize, initialSize, children }) => {
  const { size, gutterProps, minimized, handleResetSize } = useHooks(
    direction,
    gutter,
    initialSize,
    minSize,
  );

  const showTopGutter = direction === "horizontal" && gutter === "start";
  const showRightGutter = direction === "vertical" && gutter === "end";
  const showBottomGutter = direction === "horizontal" && gutter === "end";
  const showLeftGutter = direction === "vertical" && gutter === "start";

  const TopGutter = showTopGutter ? <HorizontalGutter {...gutterProps} /> : null;
  const RightGutter = showRightGutter ? <VerticalGutter {...gutterProps} /> : null;
  const BottomGutter = showBottomGutter ? <HorizontalGutter {...gutterProps} /> : null;
  const LeftGutter = showLeftGutter ? <VerticalGutter {...gutterProps} /> : null;

  return (
    <>
      {minimized ? (
        <MinimizedWrapper direction={direction} onClick={handleResetSize}>
          <Icon icon={gutter == "end" ? "arrowRight" : "arrowLeft"} />
        </MinimizedWrapper>
      ) : (
        <StyledResizable direction={direction} size={size} minSize={minSize}>
          {TopGutter}
          {LeftGutter}
          <Wrapper>{children}</Wrapper>
          {RightGutter}
          {BottomGutter}
        </StyledResizable>
      )}
    </>
  );
};

const StyledResizable = styled.div<{
  direction: "vertical" | "horizontal";
  size: number;
  minSize?: number;
}>`
  display: flex;
  align-items: stretch;
  flex-direction: ${({ direction }) => (direction === "vertical" ? "row" : "column")};
  width: ${({ direction, size }) => (direction === "horizontal" ? null : `${size}px`)};
  height: ${({ direction, size }) => (direction === "vertical" ? null : `${size}px`)};
  flex-shrink: 0;
  min-width: ${({ direction, minSize }) =>
    direction === "vertical" && minSize ? `${minSize}px` : null};
  min-height: ${({ direction, minSize }) =>
    direction === "horizontal" && minSize ? `${minSize}px` : null};
`;

const Wrapper = styled.div`
  width: calc(100% - 4px);
  height: 100%;
  background: ${({ theme }) => theme.general.bg.veryStrong};
`;

const Gutter = styled.div`
  user-select: none;
  background: ${({ theme }) => theme.general.bg.veryStrong};
`;

const HorizontalGutter = styled(Gutter)`
  height: 4px;
  cursor: row-resize;
`;

const VerticalGutter = styled(Gutter)`
  width: 4px;
  cursor: col-resize;
`;

const MinimizedWrapper = styled.div<Pick<Props, "direction">>`
  display: flex;
  align-items: center;
  width: ${({ direction }) => (direction === "horizontal" ? null : `24px`)};
  height: ${({ direction }) => (direction === "vertical" ? null : `24px`)};
  background: ${({ theme }) => theme.general.bg.weak};
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: ${({ theme }) => theme.general.bg.veryWeak};
  }
`;
export default Resizable;
