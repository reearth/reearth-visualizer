import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Popup, Icon, Typography, IconName, PopupProps } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

const MULTLEVEL_OFFSET = 12;
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
  iconColor?: string;
  menu: PopupMenuItem[];
  nested?: boolean;
  width?: number;
  extendTriggerWidth?: boolean;
  size?: "small" | "normal";
  placement?: PopupProps["placement"];
  triggerOnHover?: boolean;
  openMenu?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const PopupMenu: FC<PopupMenuProps> = ({
  label,
  menu,
  nested,
  width,
  extendTriggerWidth,
  placement,
  triggerOnHover,
  iconColor,
  icon,
  openMenu = false,
  size = "normal",
  onOpenChange,
}) => {
  const [open, setOpen] = useState(openMenu);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    setOpen(openMenu);
  }, [openMenu]);

  const handlePopOver = useCallback(
    (state?: boolean) => {
      if (state === undefined) {
        setOpen(!open);
        onOpenChange?.(!open);
      } else {
        setOpen(state);
        onOpenChange?.(state);
      }
    },
    [onOpenChange, open],
  );

  const renderMenuItems = (menuItems: PopupMenuItem[]) => {
    return (
      <PopupMenuWrapper width={width} nested={nested}>
        {menuItems.map(({ title, path, icon, subItem, id, onClick }, index) => (
          <Item
            key={index}
            onMouseEnter={() => setHoveredItemIndex(index)}
            onMouseLeave={() => setHoveredItemIndex(null)}
            isHovered={hoveredItemIndex === index}
            size={size}
            onClick={() => {
              onClick?.(id);
              handlePopOver(false);
            }}>
            {icon && (
              <Icon icon={icon} size="small" color={iconColor ? iconColor : theme.content.weak} />
            )}
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
      extendTriggerWidth={extendTriggerWidth || nested ? true : false}
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

const PopupMenuWrapper = styled("div")<{ width?: number; nested?: boolean }>(
  ({ width, nested, theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: `${theme.spacing.micro}px`,
    padding: `${theme.spacing.micro}px`,
    backgroundColor: `${theme.bg[1]}`,
    boxShadow: `${theme.shadow.popup}`,
    borderRadius: `${theme.radius.small}px`,
    border: `1px solid ${theme.outline.weaker}`,
    width: width ? `${width}px` : DEFAULT_MENU_WIDTH,
    maxHeight: "250px",
    overflowY: "auto",
    margin: nested ? "-7px 0 0 2px" : "inherit",
  }),
);

const Item = styled("div")<{ isHovered?: boolean; size?: "small" | "normal" }>(
  ({ theme, isHovered, size }) => ({
    display: "flex",
    gap: theme.spacing.smallest,
    alignItems: "center",
    padding:
      size === "small"
        ? `${theme.spacing.micro}px ${theme.spacing.smallest}px`
        : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
    borderRadius: `${theme.radius.smallest}px`,
    cursor: "pointer",
    backgroundColor: isHovered ? `${theme.bg[2]}` : "transparent",
  }),
);

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));
