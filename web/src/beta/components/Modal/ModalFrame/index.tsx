import useTransition, { TransitionStatus } from "@rot1024/use-transition";
import { ReactNode, useRef, useCallback } from "react";
import { useClickAway, useKeyPressEvent } from "react-use";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type Props = {
  className?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  isVisible?: boolean;
  modalTitle?: string;
  onClose?: () => void;
};

const Modal: React.FC<Props> = ({ className, size, isVisible, modalTitle, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useClickAway(ref, () => onClose?.());

  const state = useTransition(!!isVisible, 300, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  const handleClose = useCallback(() => {
    if (isVisible) onClose?.();
  }, [onClose, isVisible]);

  useKeyPressEvent("Escape", handleClose);

  return state === "unmounted" ? null : (
    <Bg state={state}>
      <Wrapper className={className} ref={ref} size={size}>
        {!!modalTitle && (
          <HeaderWrapper>
            <ModalTitle size="h4" weight="bold" color={theme.general.content.strong}>
              {modalTitle}
            </ModalTitle>
            {onClose && <CloseIcon icon="cancel" onClick={onClose} />}
          </HeaderWrapper>
        )}
        <InnerWrapper>{children}</InnerWrapper>
      </Wrapper>
    </Bg>
  );
};

const Bg = styled.div<{ state: TransitionStatus }>`
  background: ${({ theme }) => theme.general.bg.transparent};
  position: fixed;
  z-index: ${({ theme }) => theme.zIndexes.fullScreenModal};
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  transition: ${({ state }) =>
    state === "entering" || state === "exiting" ? "all 0.3s ease" : ""};
  opacity: ${({ state }) => (state === "entered" || state === "entering" ? 1 : 0)};
`;

const Wrapper = styled.div<{ size?: string }>`
  margin: ${({ size }) => (size === "sm" ? "15%" : size === "lg" ? "4%" : "8%")} auto;
  padding-top: 36px;
  padding-bottom: 36px;
  border-radius: var(--spacing-small, 8px);
  background: var(--editor-background-0, #161616);
  width: ${({ size }) => (size === "sm" ? "372px" : size === "lg" ? "684px" : "620px")};
  position: relative;
`;

const InnerWrapper = styled.div<{ size?: string }>`
  margin: 0 auto;
`;

const ModalTitle = styled(Text)`
  text-align: center;
  margin-right: auto;
`;

const CloseIcon = styled(Icon)`
  margin-left: auto;
  cursor: pointer;
`;

const HeaderWrapper = styled.div`
  display: flex;
  padding: var(--spacing-normal, 12px);
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-top-right-radius: var(--spacing-small, 8px);
  border-top-left-radius: var(--spacing-small, 8px);
  background: var(--editor-background-2, #393939);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;
export default Modal;
