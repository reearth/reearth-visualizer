import useTransition, { TransitionStatus } from "@rot1024/use-transition";
import { ReactNode, useRef, useCallback } from "react";
import { useClickAway, useKeyPressEvent } from "react-use";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

export type Props = {
  className?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  isVisible?: boolean;
  onClose?: () => void;
};

const Modal: React.FC<Props> = ({ className, size, isVisible, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
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
        {onClose && (
          <CloseButton onClick={handleClose}>
            <Icon icon="cancel" />
          </CloseButton>
        )}
        <InnerWrapper>{children}</InnerWrapper>
      </Wrapper>
    </Bg>
  );
};

const Bg = styled.div<{ state: TransitionStatus }>`
  background: ${props => props.theme.main.transparentBg};
  position: fixed;
  z-index: ${props => props.theme.zIndexes.fullScreenModal};
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
  margin: ${props => (props.size === "sm" ? "15%" : props.size === "lg" ? "4%" : "8%")} auto;
  padding: 36px 32px;
  border-radius: 3px;
  width: ${props => (props.size === "sm" ? "372px" : props.size === "lg" ? "684px" : "620px")};
  background: ${props => props.theme.main.deepBg};
  position: relative;
`;

const InnerWrapper = styled.div<{ size?: string }>`
  margin: 0 auto;
`;

const CloseButton = styled.span`
  color: ${props => props.theme.main.text};
  font-size: 24px;
  position: absolute;
  right: 32px;
  top: 20px;
  cursor: pointer;
`;

export default Modal;
