import Icon from "@reearth/beta/components/Icon";
import { styled, css } from "@reearth/services/theme";
import { useRef, useCallback, useEffect, ReactNode } from "react";
import { usePopper } from "react-popper";

import Portal from "../Portal";

export interface Props {
  className?: string;
  pos?: "top" | "bottom";
  mode?: "hidden" | "dragging" | "visible";
  onButtonClick?: () => void;
  children?: ReactNode;
}

const InsertionBar: React.FC<Props> = ({
  className,
  children,
  pos,
  mode = "visible",
  onButtonClick,
}) => {
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
    if (mode !== "visible") return;
    onButtonClick?.();
  }, [mode, onButtonClick]);

  // TODO: わかりずらい。もっといい方法ありそう。
  useEffect(() => {
    if (children) {
      updatePopper?.();
    }
  }, [children, updatePopper]);

  return (
    <>
      <Wrapper
        ref={referenceElement}
        className={className}
        hovered={!!children}
        pos={pos}
        mode={mode}
        onClick={handleClick}
      >
        <InsertLine
          className="WORKAROUND_INSERTION_BAR"
          circleVisible={mode === "dragging"}
        />
        <ButtonWrapper
          className="WORKAROUND_INSERTION_BAR"
          visible={mode === "visible"}
          hovered={!!children}
        >
          <StyledAddButton onClick={handleClick} icon="plusSquare" size={13} />
        </ButtonWrapper>
      </Wrapper>
      <Portal>
        <div
          ref={popperElement}
          style={{ ...styles.popper }}
          {...attributes.popper}
        >
          {children}
        </div>
      </Portal>
    </>
  );
};

const StyledAddButton = styled(Icon)`
  background: ${({ theme }) => theme.bg[2]};
  cursor: pointer;
  display: block;
  padding: 0 3px;
`;

const ButtonWrapper = styled.div<{ visible?: boolean; hovered?: boolean }>`
  display: ${(props) => (props.visible ? "block" : "none")};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${({ hovered, theme }) =>
    hovered ? theme.content.withBackground : theme.content.main};
`;

const InsertLine = styled.div<{ circleVisible?: boolean }>`
  position: absolute;
  left: 15px;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  height: 2px;
  background: ${({ theme }) => theme.select.main};

  &::before {
    display: ${(props) => (props.circleVisible ? "block" : "none")};
    content: "";
    position: absolute;
    left: 0;
    top: -4px;
    width: 6px;
    height: 6px;
    border: 2px solid ${({ theme }) => theme.select.main};
    border-radius: 50%;
  }
`;

type WrapperProps = {
  mode?: "visible" | "dragging" | "hidden";
  pos?: "top" | "bottom";
  hovered?: boolean;
};

const Wrapper = styled.div<WrapperProps>`
  ${({ mode }) =>
    mode === "hidden" &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
  position: absolute;
  left: 0;
  width: 100%;
  z-index: ${(props) =>
    props.theme.zIndexes.visualizer.storyPage.indicator.unselected};
  top: ${(props) => (props.pos === "top" ? "0%" : "100%")};
  transform: translateY(-50%);
  height: 15px;
  cursor: pointer;

  & .WORKAROUND_INSERTION_BAR {
    opacity: ${(props) =>
      !props.hovered && props.mode === "visible" ? "0" : "1"};
    transition: all 0.5s;
  }

  &:hover .WORKAROUND_INSERTION_BAR {
    opacity: 1;
  }
`;

export default InsertionBar;
