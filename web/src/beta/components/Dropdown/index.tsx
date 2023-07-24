import { ReactNode, useState, Fragment } from "react";

import Icon, { Icons } from "@reearth/beta/components/Icon";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/beta/features/Navbar/Menus/MenuList";
import { styled } from "@reearth/services/theme";

import Text from "../Text";

type Direction = "right" | "down" | "none";

type Gap = "sm" | "md" | "lg";

export type Menu = {
  width?: number;
  items?: MenuItem[];
};

export type MenuItem = {
  text?: string;
  icon?: Icons;
  iconPosition?: "left" | "right";
  breakpoint?: boolean;
  items?: MenuItem[];
  linkTo?: string;
  selected?: boolean;
  onClick?: () => void;
};

export type Props = {
  className?: string;
  isOpen?: boolean;
  label: ReactNode;
  openOnClick?: boolean;
  direction?: Direction;
  gap?: Gap;
  dropdownWidth?: number;
  parentWidth?: number;
  hasIcon?: boolean;
  noHoverStyle?: boolean;
  centered?: boolean;
  menu?: Menu;
  isChild?: boolean;
  onClick?: () => void;
};

const defaultWidth = 200;

const Dropdown: React.FC<Props> = ({
  className,
  isOpen = false,
  label,
  openOnClick,
  direction = "down",
  gap,
  dropdownWidth = defaultWidth,
  parentWidth = defaultWidth,
  centered,
  noHoverStyle,
  hasIcon,
  menu,
  isChild,
  onClick,
}) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <Wrapper className={className}>
      <Parent
        noHover={noHoverStyle}
        centered={centered}
        onClick={openOnClick ? () => setOpen(o => !o) : undefined}
        onMouseEnter={openOnClick ? undefined : () => setOpen(true)}
        onMouseLeave={openOnClick ? undefined : () => setOpen(false)}>
        <Label isChild={isChild}>
          {label}
          {hasIcon && (
            <StyledIcon icon={direction === "right" ? "arrowRight" : "arrowDown"} size={16} />
          )}
        </Label>
      </Parent>
      {open && (
        <StyledMenuList
          direction={direction}
          gap={gap}
          dropdownWidth={dropdownWidth}
          parentWidth={parentWidth}>
          {menu?.items?.map((item, idx) => {
            const handleClick = () => {
              onClick?.();
              setOpen(false);
              item.onClick?.();
            };

            return (
              <Fragment key={idx}>
                {item.items ? (
                  <Dropdown
                    direction="right"
                    hasIcon
                    openOnClick
                    gap="sm"
                    isChild
                    dropdownWidth={menu.width}
                    parentWidth={dropdownWidth}
                    label={
                      <MenuListItem noHover>
                        <MenuListItemLabel text={item.text} />
                      </MenuListItem>
                    }
                    menu={{ items: item.items }}
                    onClick={handleClick}
                  />
                ) : item.linkTo ? (
                  <MenuListItem>
                    <MenuListItemLabel linkTo={item.linkTo} text={item.text} icon={item.icon} />
                    {item.selected && <SelectedIcon isActive />}
                  </MenuListItem>
                ) : item.onClick ? (
                  <MenuListItem>
                    <MenuListItemLabel onClick={handleClick} text={item.text} icon={item.icon} />
                    {item.selected && <SelectedIcon isActive />}
                  </MenuListItem>
                ) : item.text ? (
                  <InfoOnlyItem size="h5">{item.text}</InfoOnlyItem>
                ) : item.breakpoint ? (
                  <Spacer />
                ) : null}
              </Fragment>
            );
          })}
        </StyledMenuList>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const Parent = styled.div<{ noHover?: boolean; centered?: boolean }>`
  display: flex;
  align-items: center;
  ${({ centered }) => centered && "justify-content: center;"}
  height: inherit;
  border-radius: 4px;
  color: inherit;
  transition: all 0.3s;
  cursor: pointer;

  :hover {
    ${({ noHover, theme }) =>
      !noHover &&
      `
    color: ${theme.general.content.main};
    background: ${theme.general.bg.main};
      `}
  }
`;

const Label = styled.div<{ isChild?: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  user-select: none;

  ${({ isChild }) =>
    !isChild &&
    `
margin-left: 8px;
margin-right: 8px;
`}
`;

const childTransform = (direction: Direction, width: number, gap?: Gap) => {
  let translateValue;
  if (direction === "down") {
    translateValue = gap ? (gap === "sm" ? "102%" : gap === "md" ? "104%" : "106%") : "100%";
  } else {
    translateValue = gap
      ? gap === "sm"
        ? `${width * 1.02}px`
        : gap === "md"
        ? `${width * 1.04}px`
        : `${width * 1.06}px`
      : width;
  }
  switch (direction) {
    case "right":
    case "none":
      return `translateX(${translateValue})`;
    case "down":
    default:
      return `translateY(${translateValue})`;
  }
};

const StyledMenuList = styled(MenuList)<{
  direction: Direction;
  dropdownWidth: number;
  parentWidth?: number;
  gap?: Gap;
}>`
  position: absolute;
  background: ${({ theme }) => theme.navbar.bg.main};

  width: ${({ dropdownWidth }) => (dropdownWidth ? `${dropdownWidth}px` : "200px")};
  margin: 0 auto;
  padding: 2px 0;
  left: 0;
  right: 0;
  top: ${({ direction }) => (direction === "down" ? "auto" : "0")};
  bottom: ${({ direction }) => (direction === "down" ? "0" : "auto")};
  transform: ${({ direction, dropdownWidth, parentWidth, gap }) =>
    childTransform(direction, parentWidth ?? dropdownWidth, gap)};
  box-shadow: 6px 6px 8px rgba(0, 0, 0, 0.3);
  z-index: ${props => props.theme.zIndexes.dropDown};
`;

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.general.content.weak};
  pointer-events: none;
`;

const SelectedIcon = styled.div<{ isActive: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 4px;
  order: 2;
  background-color: ${({ theme }) => theme.general.select};
`;

// const ChildrenWrapper = styled.div`
//   background: ${({ theme }) => theme.general.bg.strong};
//   border-radius: 4px;
// `;

const Spacer = styled.div`
  border-top: 0.5px solid ${({ theme }) => theme.general.border};
  margin: 2px 0;
`;

const InfoOnlyItem = styled(Text)`
  padding: 2px 16px;
  cursor: default;
  user-select: none;
`;

export default Dropdown;
