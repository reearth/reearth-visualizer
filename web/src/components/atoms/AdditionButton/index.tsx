import React, { useRef, useCallback, useEffect } from "react";
import { usePopper } from "react-popper";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

import Portal from "../Portal";

export interface Props {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const AdditionButton: React.FC<Props> = ({ className, children, disabled, onClick }) => {
  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const {
    styles,
    attributes,
    update: updatePopper,
  } = usePopper(referenceElement.current, popperElement.current, {
    placement: "bottom",
    strategy: "fixed",
    modifiers: [
      {
        name: "eventListeners",
        enabled: false,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
  }, [disabled, onClick]);

  // TODO: わかりずらい。もっといい方法ありそう。
  useEffect(() => {
    if (children) {
      updatePopper?.();
    }
  }, [children, updatePopper]);

  return (
    <Wrapper>
      <InsertArea onClick={handleClick}>
        <Line />
        <Button className={className} ref={referenceElement}>
          <StyledIcon icon="plusSquare" size={13} />
        </Button>
        <Line />
      </InsertArea>
      <Portal>
        <div ref={popperElement} style={{ ...styles.popper, zIndex: 1000 }} {...attributes.popper}>
          {children}
        </div>
      </Portal>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    * {
      visibility: visible;
      opacity: 1;
    }
  }
`;

const InsertArea = styled.div`
  width: 100%;
  padding: 0 0 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: all 0.5s;
`;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.infoBox.accent};
`;

const Button = styled.div`
  color: ${props => props.theme.infoBox.accent};
  margin: 0 3px;
`;

const Line = styled.div`
  width: 43%;
  background-color: ${props => props.theme.main.accent};
  height: 2px;
  margin-top: -2px;
`;

export default AdditionButton;
