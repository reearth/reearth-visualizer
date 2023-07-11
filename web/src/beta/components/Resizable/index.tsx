import { ReactNode, useCallback, useEffect, useState } from "react";

import Icon from "@reearth/classic/components/atoms/Icon";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  children?: ReactNode;
  direction: "vertical" | "horizontal";
  gutter: "start" | "end";
  size: number;
  minSize?: number;
  maxSize?: number;
};

const Resizable: React.FC<Props> = ({
  direction,
  gutter,
  size: initialSize,
  minSize,
  maxSize,
  children,
}) => {
  const { size, gutterProps, onInitializeSize } = useHooks(
    direction,
    gutter,
    initialSize,
    minSize,
    maxSize,
  );
  const [minimized, setMinimized] = useState(false);

  const showTopGutter = direction === "horizontal" && gutter === "start";
  const showRightGutter = direction === "vertical" && gutter === "end";
  const showBottomGutter = direction === "horizontal" && gutter === "end";
  const showLeftGutter = direction === "vertical" && gutter === "start";

  const TopGutter = showTopGutter ? <HorizontalGutter {...gutterProps} /> : null;
  const RightGutter = showRightGutter ? <VerticalGutter {...gutterProps} /> : null;
  const BottomGutter = showBottomGutter ? <HorizontalGutter {...gutterProps} /> : null;
  const LeftGutter = showLeftGutter ? <VerticalGutter {...gutterProps} /> : null;

  useEffect(() => {
    if (size <= initialSize / 2) {
      setMinimized(true);
    } else {
      setMinimized(false);
    }
  }, [direction, initialSize, size]);

  const handleShowOriginalPanel = useCallback(() => {
    setMinimized(false);
    onInitializeSize();
  }, [onInitializeSize]);
  return (
    <>
      {minimized ? (
        <MinimizedWrapper direction={direction} onClick={handleShowOriginalPanel}>
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

const StyledResizable = styled.div<Pick<Props, "direction" | "size" | "minSize">>`
  display: flex;
  align-items: stretch;
  flex-direction: ${({ direction }) => (direction === "vertical" ? "row" : "column")};
  width: ${({ direction, size }) => (direction === "horizontal" ? null : `${size}px`)};
  height: ${({ direction, size }) => (direction === "vertical" ? null : `${size}px`)};
  flex-shrink: 0;
  resize: both;
  min-width: ${({ direction, minSize }) =>
    direction === "horizontal" && minSize ? `${minSize}px` : null};
  min-height: ${({ direction, minSize }) =>
    direction === "vertical" && minSize ? `${minSize}px` : null};
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
`;
export default Resizable;
