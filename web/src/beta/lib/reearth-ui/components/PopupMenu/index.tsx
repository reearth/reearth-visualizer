import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Popup, Icon, Typography, IconName, PopupProps } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

const MULTLEVEL_OFFSET = 12;
const DEFAULT_OFFSET = 4;
const DEFAULT_MENU_WIDTH = 180;

export type PopupMenuItem = {
  hasCustomSubMenu?: boolean;
  id: string;
  title?: string;
  path?: string;
  personal?: boolean;
  icon?: IconName;
  selected?: boolean;
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
  const [open, setOpen] = useState(false);
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

  const renderSingleItem = (item: PopupMenuItem, index: number) => {
    const { icon, id, onClick, path, selected, subItem, title } = item;
    return (
      <Item
        key={index}
        size={size}
        onClick={() => {
          onClick?.(id);
          handlePopOver(false);
        }}>
        {icon && (
          <Icon icon={icon} size="small" color={iconColor ? iconColor : theme.content.weak} />
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            justifyItems: "center",
            flexGrow: 1,
          }}>
          {subItem ? (
            <PopupMenu label={title} menu={subItem} width={width} nested />
          ) : path ? (
            <StyledLink to={path}>
              <Typography size="body">{title}</Typography>
            </StyledLink>
          ) : (
            <Typography size="body">{title}</Typography>
          )}
          {selected && <Icon icon="check" size="small" color={theme.content.main} />}
        </div>
      </Item>
    );
  };

  const renderSubMenuItems = (subMenuItems: PopupMenuItem[]) => {
    const personalWorkspaces = subMenuItems.filter(item => !!item.personal);
    const teamWorkspaces = subMenuItems.filter(item => !item.personal);

    return (
      <PopupMenuWrapper width={width} nested={nested}>
        <SubMenuHeader>Personal</SubMenuHeader>
        {personalWorkspaces.map((item, index) => {
          return renderSingleItem(item, index);
        })}
        <SubMenuHeader>Team</SubMenuHeader>
        {teamWorkspaces.map((item, index) => {
          return renderSingleItem(item, index);
        })}
      </PopupMenuWrapper>
    );
  };

  const renderMenuItems = (menuItems: PopupMenuItem[]) => {
    return (
      <PopupMenuWrapper width={width} nested={nested}>
        {menuItems.map((item, index) => {
          return renderSingleItem(item, index);
        })}
      </PopupMenuWrapper>
    );
  };

  const renderTrigger = () => {
    return typeof label === "string" ? (
      <>
        {icon && <Icon icon={icon} size="small" />}
        <Typography size="body" weight="bold">
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
      {nested && !!menu.find(item => item.hasCustomSubMenu)
        ? renderSubMenuItems(menu)
        : renderMenuItems(menu)}
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
    ["::-webkit-scrollbar"]: {
      width: "8px",
    },
    ["::-webkit-scrollbar-track"]: {
      background: theme.relative.darker,
      borderRadius: "10px",
    },
    ["::-webkit-scrollbar-thumb"]: {
      background: theme.relative.light,
      borderRadius: "4px",
    },
    ["::-webkit-scrollbar-thumb:hover"]: {
      background: theme.relative.lighter,
    },
  }),
);

const Item = styled("div")<{ size?: "small" | "normal" }>(({ theme, size }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  padding:
    size === "small"
      ? `${theme.spacing.micro}px ${theme.spacing.smallest}px`
      : `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: "pointer",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));

const SubMenuHeader = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: "11px",
  fontWeight: 400,
  lineHeight: "16px",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px  0 ${theme.spacing.small}px`,
}));
