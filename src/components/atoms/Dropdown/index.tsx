import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useClickAway } from "react-use";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

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
  width: 100%;
`;

const Parent = styled.div<{ noHover?: boolean; centered?: boolean }>`
  position: relative;
  height: inherit;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${props => props.centered && `center;`}
  background-color: ${props => props.theme.header.bg};
  &:hover {
    ${({ noHover, theme }) =>
      !noHover &&
      `
      background-color: ${theme.main.bg};
      `}
    }
    `;

const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 100%;
`;

const childTransform = (direction: Direction) => {
  switch (direction) {
    case "down":
      return "translateY(100%)";
    case "right":
    case "none":
      return "translateX(100%)";
    default:
      return "translateY(100%)";
  }
};

const Child = styled.div<{ direction: Direction }>`
  position: absolute;
  background-color: ${props => props.theme.header.bg};
  max-width: 230px;
  margin: 0 auto;
  left: 0;
  right: 0;
  top: ${({ direction }) => (direction === "down" ? "auto" : "0")};
  bottom: ${({ direction }) => (direction === "down" ? "0" : "auto")};
  transform: ${({ direction }) => childTransform(direction)};
  box-shadow: 6px 6px 8px rgba(0, 0, 0, 0.3);
  z-index: ${props => props.theme.zIndexes.dropDown};
`;

const StyledIcon = styled(Icon)`
  margin: 0 16px;
  color: ${props => props.theme.header.text};
`;

export default forwardRef(Dropdown);
