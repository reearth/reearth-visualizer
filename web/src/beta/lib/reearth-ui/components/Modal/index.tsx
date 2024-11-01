import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useMemo, useRef } from "react";

export type ModalProps = {
  visible: boolean;
  children: ReactNode;
  size?: "small" | "medium" | "large";
};

const DEFAULT_SMALL_WIDTH = 416;
const DEFAULT_MEDIUM_WIDTH = 572;
const DEFAULT_LARGE_WIDTH = 778;

export const Modal: FC<ModalProps> = ({ visible, children, size }) => {
  const ref = useRef<HTMLDivElement>(null);

  const modalWidth = useMemo(
    () =>
      size === "small"
        ? DEFAULT_SMALL_WIDTH
        : size === "large"
          ? DEFAULT_LARGE_WIDTH
          : DEFAULT_MEDIUM_WIDTH,
    [size]
  );

  return !visible ? null : (
    <Wrapper>
      <ContentWrapper modalWidth={modalWidth} ref={ref}>
        {children}
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  background: theme.bg.transparentBlack,
  position: "fixed",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  overflow: "auto",
  opacity: 1,
  zIndex: theme.zIndexes.editor.modal.bg
}));

const ContentWrapper = styled("div")<{ modalWidth?: number }>(
  ({ modalWidth }) => ({
    margin: "0 auto",
    height: "100%",
    width: `${modalWidth}px`,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  })
);
