import { FC, ReactNode, useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { Popup, Icon, Typography, IconName, PopupProps } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

const MULTLEVEL_OFFSET = 6;
const DEFAULT_OFFSET = 4;
const DEFAULT_MENU_WIDTH = 180;

export type PopupMenuItem = {
  id: string;
  title?: string;
  path?: string;
  icon?: IconName;
  subItem?: PopupMenuItem[];
  onClick?: (id: string) => void;
};

export type PopupMenuProps = {
  label?: string | ReactNode;
  icon?: IconName;
  menu: PopupMenuItem[];
  nested?: boolean;
  width?: number;
  extendTriggerWidth?: boolean;
  placement?: PopupProps["placement"];
  triggerOnHover?: boolean;
};

export const PopupMenu: FC<PopupMenuProps> = ({
  label,
  menu,
  nested,
  width,
  extendTriggerWidth,
  placement,
  triggerOnHover,
  icon,
}) => {
  const [open, setOpen] = useState(false);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const theme = useTheme();

  const handlePopOver = useCallback(
    (state?: boolean) => {
      if (state === undefined) {
        setOpen(!open);
      } else {
        setOpen(state);
      }
    },
    [open],
  );
  const renderMenuItems = (menuItems: PopupMenuItem[]) => {
    return (
      <PopupMenuWrapper width={width}>
        {menuItems.map(({ title, path, icon, subItem, id, onClick }, index) => (
          <Item
            key={index}
            onMouseEnter={() => setHoveredItemIndex(index)}
            onMouseLeave={() => setHoveredItemIndex(null)}
            isHovered={hoveredItemIndex === index}
            onClick={() => {
              onClick?.(id);
              handlePopOver(false);
            }}>
            {" "}
            {icon && <Icon icon={icon} size="small" color={theme.content.weak} />}
            {subItem ? (
              <PopupMenu label={title} menu={subItem} width={width} nested />
            ) : path ? (
              <StyledLink to={path}>
                <Typography size="body">{title}</Typography>
              </StyledLink>
            ) : (
              <Typography size="body">{title}</Typography>
            )}
          </Item>
        ))}
      </PopupMenuWrapper>
    );
  };

  const renderTrigger = () => {
    return typeof label === "string" ? (
      <>
        {icon && <Icon icon={icon} size="small" />}
        <Typography size="body" weight="regular">
          {label}
        </Typography>
        <Icon color={theme.content.weak} icon={nested ? "caretRight" : "caretDown"} size="small" />
      </>
    ) : label ? (
      label
    ) : icon ? (
      <Icon icon={icon} size="small" />
    ) : null;
  };

  return (
    <Popup
      open={open}
      placement={placement ? placement : nested ? "right-start" : "bottom-start"}
      offset={nested ? MULTLEVEL_OFFSET : DEFAULT_OFFSET}
      onOpenChange={handlePopOver}
      triggerOnHover={triggerOnHover || nested ? true : false}
      extendTriggerWidth={extendTriggerWidth}
      autoClose
      trigger={
        <TriggerWrapper onClick={() => handlePopOver()} nested={nested}>
          {renderTrigger()}
        </TriggerWrapper>
      }>
      {renderMenuItems(menu)}
    </Popup>
  );
};

const TriggerWrapper = styled("div")<{ nested?: boolean }>(({ nested, theme }) => ({
  cursor: "pointer",
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  justifyContent: nested ? "space-between" : "normal",
}));

const PopupMenuWrapper = styled("div")<{ width?: number }>(({ width, theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  width: width ? `${width}px` : DEFAULT_MENU_WIDTH,
}));

const Item = styled("div")<{ isHovered?: boolean }>(({ theme, isHovered }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: "pointer",
  backgroundColor: isHovered ? `${theme.bg[2]}` : "transparent",
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));
