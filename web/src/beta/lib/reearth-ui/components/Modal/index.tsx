import useTransition from "@rot1024/use-transition";
import { FC, ReactNode, useCallback, useMemo, useRef } from "react";
import { useClickAway, useKeyPressEvent } from "react-use";

import { styled } from "@reearth/services/theme";

export type ModalProps = {
  visible: boolean;
  children: ReactNode;
  size?: "small" | "medium" | "large";
  onClose?: () => void;
};

const DEFAULT_MODAL_WIDTH = 572;

export const Modal: FC<ModalProps> = ({ visible, children, size, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => onClose?.());

  const modalWidth = useMemo(
    () => (size === "small" ? 416 : size === "large" ? 778 : DEFAULT_MODAL_WIDTH),
    [size],
  );

  const state = useTransition(visible, 300, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  const handleClose = useCallback(() => {
    if (visible) onClose?.();
  }, [onClose, visible]);

  useKeyPressEvent("Escape", handleClose);

  return state === "unmounted" ? null : (
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
  zIndex: theme.zIndexes.editor.modal.bg,
}));

const ContentWrapper = styled("div")<{ modalWidth?: number }>(({ modalWidth }) => ({
  margin: "0 auto",
  height: "100%",
  width: `${modalWidth}px`,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));
