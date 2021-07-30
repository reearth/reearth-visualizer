import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";
import { useClickAway } from "react-use";

type Direction = "right" | "down" | "none";

export type Props = {
  isOpen?: boolean;
  label: React.ReactNode;
  openOnClick?: boolean;
  direction?: Direction;
  hasIcon?: boolean;
  noHoverStyle?: boolean;
  centered?: boolean;
  children?: React.ReactNode;
};

export type Ref = {
  close: () => void;
};

const Dropdown: React.ForwardRefRenderFunction<Ref, Props> = (
  {
    isOpen = false,
    openOnClick,
    noHoverStyle,
    centered,
    label,
    direction = "down",
    hasIcon,
    children,
  },
  ref,
) => {
  const [open, setOpen] = useState(isOpen);

  const wrapperRef = useRef(null);
  useClickAway(wrapperRef, () => {
    setOpen(false);
  });

  useImperativeHandle(
    ref,
    () => ({
      close: () => setOpen(false),
    }),
    [],
  );

  return (
    <Wrapper
      ref={wrapperRef}
      onMouseEnter={openOnClick ? undefined : () => setOpen(true)}
      onMouseLeave={openOnClick ? undefined : () => setOpen(false)}>
      <Parent noHover={noHoverStyle} centered={centered}>
        <Label onClick={openOnClick ? () => setOpen(o => !o) : undefined}>
          {label}
          {hasIcon && (
            <StyledIcon icon={direction === "right" ? "arrowRight" : "arrowDown"} size={24} />
          )}
        </Label>
      </Parent>
      {open && (
        <Child onClick={openOnClick ? () => setOpen(o => !o) : undefined} direction={direction}>
          {children}
        </Child>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
`;

const Parent = styled.div<{ noHover?: boolean; centered?: boolean }>`
  position: relative;
  min-height: 36px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${props => props.centered && `center;`}
  background-color: ${props => props.theme.header.bg};
  &:hover {
    ${props =>
      !props.noHover &&
      `
      background-color: ${props.theme.main.bg};
      `}
    }
    `;

const Label = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const childTransform = (direction: Direction) => {
  switch (direction) {
    case "down":
      return "translate(0, 100%)";
    case "right":
    case "none":
      return "translate(100%, 0)";
    default:
      return "translate(0, 100%)";
  }
};

const Child = styled.div<{ direction: Direction }>`
  position: absolute;
  left: 0;
  bottom: ${({ direction }) => (direction === "down" ? "0" : "auto")};
  min-width: 100%;
  top: ${({ direction }) => (direction === "down" ? "auto" : "0")};
  transform: ${({ direction }) => childTransform(direction)};
  box-shadow: 6px 6px 8px rgba(0, 0, 0, 0.3);
  background-color: ${props => props.theme.header.bg};
  z-index: ${props => props.theme.zIndexes.dropDown};
`;

const StyledIcon = styled(Icon)`
  margin: 0 16px;
  color: ${props => props.theme.header.text};
`;

export default forwardRef(Dropdown);
