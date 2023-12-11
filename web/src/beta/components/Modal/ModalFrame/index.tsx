import useTransition, { TransitionStatus } from "@rot1024/use-transition";
import { ReactNode, useRef, useCallback, useMemo } from "react";
import { useClickAway, useKeyPressEvent } from "react-use";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

export type Props = {
  className?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  isVisible?: boolean;
  title?: string;
  onClose?: () => void;
};

const Modal: React.FC<Props> = ({ className, size, isVisible, title, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => onClose?.());

  const modalWidth = useMemo(
    () => (size === "sm" ? "416px" : size === "lg" ? "778px" : "572px"),
    [size],
  );

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
      <CenteredWrapper width={modalWidth}>
        <Wrapper className={className} ref={ref} width={modalWidth}>
          {!!title && (
            <HeaderWrapper>
              <ModalTitle size="body" weight="regular" customColor>
                {title}
              </ModalTitle>
              {onClose && <CloseIcon icon="cancel" size={16} onClick={onClose} />}
            </HeaderWrapper>
          )}
          <InnerWrapper>{children}</InnerWrapper>
        </Wrapper>
      </CenteredWrapper>
    </Bg>
  );
};

const Bg = styled.div<{ state: TransitionStatus }>`
  background: ${({ theme }) => theme.bg.transparentBlack};
  position: fixed;
  z-index: ${({ theme }) => theme.zIndexes.editor.modal.bg};
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  transition: ${({ state }) =>
    state === "entering" || state === "exiting" ? "all 0.3s ease" : ""};
  opacity: ${({ state }) => (state === "entered" || state === "entering" ? 1 : 0)};
`;

const CenteredWrapper = styled.div<{ width?: string }>`
  margin-left: auto;
  margin-right: auto;
  height: 100%;
  width: ${({ width }) => width};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Wrapper = styled.div<{ width?: string }>`
  border-radius: 8px;
  background: #161616;
  width: ${({ width }) => width};
`;

const InnerWrapper = styled.div`
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
  padding: 12px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.bg[2]};
`;
export default Modal;
